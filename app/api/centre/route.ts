import dbConnect from "@/server/db";
import { latlngSchema } from "@/server/models/latlngSchema";
import { Violation } from "@/server/models/violationModel";
import { NextRequest,NextResponse } from "next/server";

type ResponseBody = {
    centerId : string,
    location: {
        zone: string;
        district: number;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    violations: {
        total: number;
        reported: number;
    };
    challans: {
        total: number;
        breakdown: {
            collected_amount: number;
        };
    };
    accidents: {
        today: number;
        overall: number;
    };
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();

    console.log(body)
    const validation = latlngSchema.safeParse(body);

    if (!validation.success) throw new Error(validation.error.message);

    const data = await Violation.findOne({
        "location.latitude": { 
          $gte: validation.data.lat - 0.00001, 
          $lte: validation.data.lat + 0.00001 
        },
        "location.longitude": { 
          $gte: validation.data.lng - 0.00001, 
          $lte: validation.data.lng + 0.00001 
        }
      });
      

    console.log(data)


    if (!data) {
        return Response.json({ error: "No data found" }, { status: 404 });
    }

    const response: ResponseBody = {
        centerId: data.centerId,
        location: {
            zone: data.location.zone,
            district: data.location.district,
            coordinates: {
                latitude: data.location.latitude,
                longitude: data.location.longitude,
            },
        },
        violations: {
            total: data.violations.total,
            reported: data.violations.reported,
        },
        challans: {
            total: data.challans.total,
            breakdown: {
                collected_amount: data.challans.breakdown.collected_amount,
            },
        },
        accidents: {
            today: data.accidents.today,
            overall: data.accidents.overall,
        },
    };

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json({
        message : "Something went wrong!",
        error : error instanceof Error ? error.message : String(error)
    })
  }
}
