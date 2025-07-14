
//
// A class to maintaing world data
//

class PTALevelData {
    level: number

}

export class ProfileData {
    filePath: string
    js3TranslationTimes: Array<number> = []
    iriTranslationTimes: Array<number> = []
    

    printProfileData() {
        const stmt = [];
        stmt.push(`Translation Times (ms): `);
        stmt.push(`Translation Times (ms): `);
        stmt.push(`  [JS3]: ${this.js3TranslationTimes.reduce((prevValue, currVal) => prevValue + currVal)}`);
        stmt.push(`  [IRI]: ${this.iriTranslationTimes.reduce((prevValue, currVal) => prevValue + currVal)}`);
        
        return stmt.join("\n");
    }
};


export class TopLevelProfileData {
    PTAExpansionTimes: Array<PTALevelData> = []
}


export const WORLD_PROFILE_DATA: Map<string, ProfileData> = new Map();
