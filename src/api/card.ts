import client from "./client";
import type {
  CardCheckResponse,
  CardAiQueueResponse,
  CardRecommendationResponse,
  CardDetail,
} from "../types/card";

export const getCardCheck = () =>
  client.get<CardCheckResponse>("/cards/check").then((r) => r.data);

export const requestCardAiRecommendation = () =>
  client.get<CardAiQueueResponse>("/cards/ai").then((r) => r.data);

export const getCardRecommendation = () =>
  client.get<CardRecommendationResponse>("/cards/recommendation").then((r) => r.data);

export const getCardDetail = (cardId: string) =>
  client.get<CardDetail>(`/cards/${cardId}`).then((r) => r.data);
