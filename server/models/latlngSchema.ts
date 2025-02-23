import { z } from "zod";

export const latlngSchema = z.object({
    lat : z.number(),
    lng : z.number()
})

export type latlngType = z.infer<typeof latlngSchema>