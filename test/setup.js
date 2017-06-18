import mongoose from "mongoose"
import mockgoose from "mockgoose"


export function setupMocha() {
    before("Mock mongoose", async () => {
        await mockgoose(mongoose)
        mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/projects')
    })

    after("Restore mongoose", done => {
        mongoose.unmock(done);
    })

    afterEach("Reset mock mongo database", done => {
        mockgoose.reset(done);
    })
}
