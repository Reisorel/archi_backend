"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/seeds/index.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // ← Charge le fichier .env
const db_1 = __importDefault(require("../config/db"));
const seedSlider_1 = __importDefault(require("./seedSlider"));
const seedNews_1 = __importDefault(require("./seedNews"));
const seedMissions_1 = __importDefault(require("./seedMissions"));
const seedProjects_1 = __importDefault(require("./seedProjects"));
const runSeeds = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.default)();
        console.log('📡 Connected to DB');
        yield (0, seedSlider_1.default)();
        yield (0, seedNews_1.default)();
        yield (0, seedMissions_1.default)();
        yield (0, seedProjects_1.default)();
        console.log('🌱 All seeds done');
        process.exit();
    }
    catch (error) {
        console.error('❌ Error during seeding', error);
        process.exit(1);
    }
});
runSeeds();
