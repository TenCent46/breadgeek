"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  Service, Booking, Customer, Contact, Review,
  DistributionMessage, SaleRecord, MonthlySales, MonthlyProfit,
  Ingredient, Recipe, MessageTemplate, KitchenSettings,
} from "./types";
import {
  mockServices, mockBookings, mockCustomers, mockContacts,
  mockReviews, mockMessages, mockSales, mockMonthlySales, mockMonthlyProfit,
  mockIngredients, mockRecipes, mockMessageTemplates, mockKitchenSettings,
} from "./mock-data";

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

interface DashboardContextType {
  // Services
  services: Service[];
  addService: (s: Omit<Service, "id" | "createdAt" | "updatedAt">) => void;
  updateService: (id: string, s: Partial<Service>) => void;
  deleteService: (id: string) => void;
  // Bookings
  bookings: Booking[];
  updateBooking: (id: string, b: Partial<Booking>) => void;
  // Customers
  customers: Customer[];
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  // Contacts
  contacts: Contact[];
  addContact: (c: Omit<Contact, "id">) => void;
  deleteContact: (id: string) => void;
  // Reviews
  reviews: Review[];
  updateReview: (id: string, r: Partial<Review>) => void;
  // Messages
  messages: DistributionMessage[];
  addMessage: (m: Omit<DistributionMessage, "id" | "createdAt">) => void;
  updateMessage: (id: string, m: Partial<DistributionMessage>) => void;
  deleteMessage: (id: string) => void;
  // Sales
  sales: SaleRecord[];
  monthlySales: MonthlySales[];
  monthlyProfit: MonthlyProfit[];
  // Recipes
  recipes: Recipe[];
  addRecipe: (r: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => void;
  updateRecipe: (id: string, r: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  // Ingredients
  ingredients: Ingredient[];
  addIngredient: (i: Omit<Ingredient, "id" | "createdAt" | "updatedAt" | "costHistory">) => void;
  updateIngredient: (id: string, i: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  // Message Templates
  messageTemplates: MessageTemplate[];
  // Kitchen Settings
  kitchenSettings: KitchenSettings;
  setKitchenSettings: (s: KitchenSettings) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const now = () => new Date().toISOString().slice(0, 10);

  // Services
  const [services, setServices] = useState<Service[]>(mockServices);
  const addService = (s: Omit<Service, "id" | "createdAt" | "updatedAt">) =>
    setServices((prev) => [...prev, { ...s, id: genId(), createdAt: now(), updatedAt: now() }]);
  const updateService = (id: string, s: Partial<Service>) =>
    setServices((prev) => prev.map((x) => (x.id === id ? { ...x, ...s, updatedAt: now() } : x)));
  const deleteService = (id: string) => setServices((prev) => prev.filter((x) => x.id !== id));

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const updateBooking = (id: string, b: Partial<Booking>) =>
    setBookings((prev) => prev.map((x) => (x.id === id ? { ...x, ...b } : x)));

  // Customers
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const updateCustomer = (id: string, c: Partial<Customer>) =>
    setCustomers((prev) => prev.map((x) => (x.id === id ? { ...x, ...c } : x)));

  // Contacts
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const addContact = (c: Omit<Contact, "id">) =>
    setContacts((prev) => [...prev, { ...c, id: genId() }]);
  const deleteContact = (id: string) => setContacts((prev) => prev.filter((x) => x.id !== id));

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const updateReview = (id: string, r: Partial<Review>) =>
    setReviews((prev) => prev.map((x) => (x.id === id ? { ...x, ...r } : x)));

  // Messages
  const [messages, setMessages] = useState<DistributionMessage[]>(mockMessages);
  const addMessage = (m: Omit<DistributionMessage, "id" | "createdAt">) =>
    setMessages((prev) => [...prev, { ...m, id: genId(), createdAt: now() }]);
  const updateMessage = (id: string, m: Partial<DistributionMessage>) =>
    setMessages((prev) => prev.map((x) => (x.id === id ? { ...x, ...m } : x)));
  const deleteMessage = (id: string) => setMessages((prev) => prev.filter((x) => x.id !== id));

  // Sales
  const [sales] = useState<SaleRecord[]>(mockSales);
  const [monthlySales] = useState<MonthlySales[]>(mockMonthlySales);
  const [monthlyProfit] = useState<MonthlyProfit[]>(mockMonthlyProfit);

  // Recipes
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const addRecipe = (r: Omit<Recipe, "id" | "createdAt" | "updatedAt">) =>
    setRecipes((prev) => [...prev, { ...r, id: genId(), createdAt: now(), updatedAt: now() }]);
  const updateRecipe = (id: string, r: Partial<Recipe>) =>
    setRecipes((prev) => prev.map((x) => (x.id === id ? { ...x, ...r, updatedAt: now() } : x)));
  const deleteRecipe = (id: string) => setRecipes((prev) => prev.filter((x) => x.id !== id));

  // Ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>(mockIngredients);
  const addIngredient = (i: Omit<Ingredient, "id" | "createdAt" | "updatedAt" | "costHistory">) =>
    setIngredients((prev) => [...prev, { ...i, id: genId(), costHistory: [{ date: now(), unitCostPerKg: i.unitCostPerKg }], createdAt: now(), updatedAt: now() }]);
  const updateIngredient = (id: string, i: Partial<Ingredient>) =>
    setIngredients((prev) => prev.map((x) => (x.id === id ? { ...x, ...i, updatedAt: now() } : x)));
  const deleteIngredient = (id: string) => setIngredients((prev) => prev.filter((x) => x.id !== id));

  // Message Templates
  const [messageTemplates] = useState<MessageTemplate[]>(mockMessageTemplates);

  // Kitchen Settings
  const [kitchenSettings, setKitchenSettings] = useState<KitchenSettings>(mockKitchenSettings);

  return (
    <DashboardContext.Provider
      value={{
        services, addService, updateService, deleteService,
        bookings, updateBooking,
        customers, updateCustomer,
        contacts, addContact, deleteContact,
        reviews, updateReview,
        messages, addMessage, updateMessage, deleteMessage,
        sales, monthlySales, monthlyProfit,
        recipes, addRecipe, updateRecipe, deleteRecipe,
        ingredients, addIngredient, updateIngredient, deleteIngredient,
        messageTemplates,
        kitchenSettings, setKitchenSettings,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
