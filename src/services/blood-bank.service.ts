import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { BloodDonor, IBloodDonor } from "@/models/blood-donor.model";
import { BloodInventory, IBloodInventory } from "@/models/blood-inventory.model";
import { BloodCollection, IBloodCollection } from "@/models/blood-collection.model";
import { BloodTest, IBloodTest } from "@/models/blood-test.model";
import { BloodCrossmatch, IBloodCrossmatch } from "@/models/blood-crossmatch.model";
import { BloodRequest, IBloodRequest } from "@/models/blood-request.model";
import { BloodIssue, IBloodIssue } from "@/models/blood-issue.model";
import { BloodReturn, IBloodReturn } from "@/models/blood-return.model";

export class BloodBankService {
  // Live Blood Bank Statistics & Stock Radar
  async getBloodBankStats() {
    await dbConnect();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    const [
      availableBags,
      totalDonors,
      pendingRequests,
      todayIssues,
      expiringSoon,
      reservedBags
    ] = await Promise.all([
      BloodInventory.find({ status: "AVAILABLE" }),
      BloodDonor.countDocuments(),
      BloodRequest.countDocuments({ status: { $in: ["PENDING", "CROSSMATCHING"] } }),
      BloodIssue.countDocuments({
        issueDate: { $gte: todayStart, $lte: todayEnd }
      }),
      BloodInventory.countDocuments({
        status: "AVAILABLE",
        expiryDate: { $lte: next7Days }
      }),
      BloodInventory.countDocuments({ status: "RESERVED" })
    ]);

    const totalAvailableUnits = availableBags.reduce(
      (sum, item) => sum + (item.unitsAvailable || 1),
      0
    );

    // Group-wise counts
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
    const groupStock: Record<string, number> = {};
    for (const bg of bloodGroups) {
      groupStock[bg] = availableBags
        .filter((b) => b.bloodGroup === bg)
        .reduce((sum, b) => sum + (b.unitsAvailable || 1), 0);
    }

    // Identify critical low blood groups (< 5 units)
    const criticalGroups = bloodGroups.filter((bg) => groupStock[bg] < 5);

    // Component breakdown
    const components = ["PRBC", "WHOLE_BLOOD", "FFP", "PLATELETS", "CRYOPRECIPITATE"];
    const componentStock: Record<string, number> = {};
    for (const comp of components) {
      componentStock[comp] = availableBags.filter((b) => b.componentType === comp).length;
    }

    return {
      totalAvailableUnits,
      totalDonors,
      pendingRequests,
      todayIssues,
      expiringSoon,
      reservedBags,
      groupStock,
      criticalGroups,
      componentStock
    };
  }

  // 1. Donors
  async getDonors(filter: any = {}) {
    await dbConnect();
    return await BloodDonor.find(filter).sort({ createdAt: -1 });
  }

  async getDonorById(id: string | Types.ObjectId) {
    await dbConnect();
    return await BloodDonor.findById(id);
  }

  async createDonor(data: Partial<IBloodDonor>) {
    await dbConnect();
    if (!data.donorCode) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.donorCode = `DNR-${todayStr}-${randomSuffix}`;
    }
    if (!data.fullName && data.firstName) {
      data.fullName = `${data.firstName} ${data.lastName || ""}`.trim();
    }
    const donor = new BloodDonor(data);
    return await donor.save();
  }

  async updateDonor(id: string | Types.ObjectId, data: Partial<IBloodDonor>) {
    await dbConnect();
    if (data.firstName || data.lastName) {
      data.fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();
    }
    return await BloodDonor.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteDonor(id: string | Types.ObjectId) {
    await dbConnect();
    return await BloodDonor.findByIdAndDelete(id);
  }

  // 2. Blood Collection
  async getCollections(filter: any = {}) {
    await dbConnect();
    return await BloodCollection.find(filter)
      .populate("donorId")
      .sort({ collectionDate: -1 });
  }

  async createCollection(data: Partial<IBloodCollection>) {
    await dbConnect();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    if (!data.collectionCode) {
      data.collectionCode = `COL-${todayStr}-${randomSuffix}`;
    }
    if (!data.bagNumber) {
      data.bagNumber = `BAG-${todayStr}-${randomSuffix}`;
    }

    const collection = new BloodCollection(data);
    const savedCollection = await collection.save();

    // Increment donor's donation count
    if (data.donorId) {
      await BloodDonor.findByIdAndUpdate(data.donorId, {
        lastDonationDate: new Date(),
        $inc: { donationCount: 1 }
      });
    }

    // Automatically create initial inventory entry for PRBC component
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 35); // 35 days standard shelf life

    await BloodInventory.create({
      bagNumber: savedCollection.bagNumber,
      bloodGroup: savedCollection.donorBloodGroup,
      componentType: "PRBC",
      volumeMl: Math.round(savedCollection.volumeCollected * 0.65),
      unitsAvailable: 1,
      storageLocation: "Blood Refrigerator 1 (2-6°C)",
      collectionDate: savedCollection.collectionDate,
      expiryDate,
      donorId: savedCollection.donorId,
      donorName: savedCollection.donorName,
      ttiTestStatus: "PENDING_TEST",
      processingFee: 1450,
      status: "AVAILABLE"
    });

    return savedCollection;
  }

  // 3. Blood Inventory
  async getInventory(filter: any = {}) {
    await dbConnect();
    return await BloodInventory.find(filter)
      .populate("donorId")
      .sort({ expiryDate: 1 });
  }

  async getInventoryById(id: string | Types.ObjectId) {
    await dbConnect();
    return await BloodInventory.findById(id).populate("donorId");
  }

  async createInventory(data: Partial<IBloodInventory>) {
    await dbConnect();
    if (!data.bagNumber) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.bagNumber = `BAG-${todayStr}-${randomSuffix}`;
    }
    const inv = new BloodInventory(data);
    return await inv.save();
  }

  async updateInventory(id: string | Types.ObjectId, data: Partial<IBloodInventory>) {
    await dbConnect();
    return await BloodInventory.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteInventory(id: string | Types.ObjectId) {
    await dbConnect();
    return await BloodInventory.findByIdAndDelete(id);
  }

  // 4. Blood Testing (TTI Serology)
  async getTests(filter: any = {}) {
    await dbConnect();
    return await BloodTest.find(filter).sort({ testedAt: -1 });
  }

  async createTest(data: Partial<IBloodTest>) {
    await dbConnect();
    if (!data.testCode) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.testCode = `TTI-${todayStr}-${randomSuffix}`;
    }

    const test = new BloodTest(data);
    const savedTest = await test.save();

    // Synchronize testing status to inventory
    if (savedTest.bagNumber) {
      if (savedTest.overallSafetyStatus === "SAFE_FOR_TRANSFUSION") {
        await BloodInventory.findOneAndUpdate(
          { bagNumber: savedTest.bagNumber },
          { ttiTestStatus: "TESTED_SAFE", status: "AVAILABLE" }
        );
      } else {
        await BloodInventory.findOneAndUpdate(
          { bagNumber: savedTest.bagNumber },
          { ttiTestStatus: "REACTIVE_DISCARDED", status: "DISCARDED" }
        );
      }
    }

    return savedTest;
  }

  // 5. Cross Matching
  async getCrossmatches(filter: any = {}) {
    await dbConnect();
    return await BloodCrossmatch.find(filter).sort({ createdAt: -1 });
  }

  async createCrossmatch(data: Partial<IBloodCrossmatch>) {
    await dbConnect();
    if (!data.crossmatchCode) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.crossmatchCode = `XM-${todayStr}-${randomSuffix}`;
    }
    if (!data.validUntil) {
      const valid = new Date();
      valid.setHours(valid.getHours() + 48); // 48-hour reservation validity
      data.validUntil = valid;
    }

    const xm = new BloodCrossmatch(data);
    const saved = await xm.save();

    // If compatible, mark the bag as RESERVED for the patient
    if (saved.overallResult === "COMPATIBLE" && saved.bagNumber) {
      await BloodInventory.findOneAndUpdate(
        { bagNumber: saved.bagNumber },
        {
          status: "RESERVED",
          reservedForPatient: saved.patientName,
          reservedUntil: saved.validUntil
        }
      );
    }

    return saved;
  }

  // 6. Blood Requests
  async getRequests(filter: any = {}) {
    await dbConnect();
    return await BloodRequest.find(filter).sort({ requiredByDate: 1 });
  }

  async createRequest(data: Partial<IBloodRequest>) {
    await dbConnect();
    if (!data.requestCode) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.requestCode = `BREQ-${todayStr}-${randomSuffix}`;
    }
    const req = new BloodRequest(data);
    return await req.save();
  }

  async updateRequest(id: string | Types.ObjectId, data: Partial<IBloodRequest>) {
    await dbConnect();
    return await BloodRequest.findByIdAndUpdate(id, data, { new: true });
  }

  // 7. Blood Issue
  async getIssues(filter: any = {}) {
    await dbConnect();
    return await BloodIssue.find(filter)
      .populate("requestId")
      .sort({ issueDate: -1 });
  }

  async createIssue(data: Partial<IBloodIssue>) {
    await dbConnect();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    if (!data.issueCode) {
      data.issueCode = `ISS-${todayStr}-${randomSuffix}`;
    }
    if (!data.transfusionVoucherNumber) {
      data.transfusionVoucherNumber = `TXV-${todayStr}-${randomSuffix}`;
    }

    const issue = new BloodIssue(data);
    const savedIssue = await issue.save();

    // Mark the blood bag as ISSUED in inventory
    if (data.bagNumber) {
      await BloodInventory.findOneAndUpdate(
        { bagNumber: data.bagNumber },
        { status: "ISSUED" }
      );
    }

    // Update corresponding BloodRequest status to ISSUED
    if (data.requestId) {
      await BloodRequest.findByIdAndUpdate(data.requestId, { status: "ISSUED" });
    }

    return savedIssue;
  }

  // 8. Blood Return
  async getReturns(filter: any = {}) {
    await dbConnect();
    return await BloodReturn.find(filter).sort({ returnDate: -1 });
  }

  async createReturn(data: Partial<IBloodReturn>) {
    await dbConnect();
    if (!data.returnCode) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.returnCode = `RET-${todayStr}-${randomSuffix}`;
    }

    const ret = new BloodReturn(data);
    const saved = await ret.save();

    // Update inventory: restock or mark as discarded
    if (saved.bagNumber) {
      if (saved.acceptanceDecision === "RESTOCKED_TO_INVENTORY") {
        await BloodInventory.findOneAndUpdate(
          { bagNumber: saved.bagNumber },
          { status: "AVAILABLE", reservedForPatient: undefined }
        );
      } else {
        await BloodInventory.findOneAndUpdate(
          { bagNumber: saved.bagNumber },
          { status: "DISCARDED" }
        );
      }
    }

    return saved;
  }
}

export const bloodBankService = new BloodBankService();
export default bloodBankService;
