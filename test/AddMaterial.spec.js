const mongoose = require("mongoose");
const Account = require("../models/mAccount");
const Material = require("../models/mMaterial");

function length_name(name) {
    if (name.length == 0) {
        return false;
    }
    return true;
}
function length_name_50(name) {
    if (name.length > 50) {
        return false;
    }
    return true;
}
function length_Desc_255(Desc) {
    if (Desc.length > 255) {
        return false;
    }
    return true;
}
function length_unit(unit) {
    if (unit.length == 0) {
        return false;
    }
    return true;
}

function match_img(img) {
    if (!img.match(/\.(jpg|jpeg|png)$/i)) {
        return false;
    } 
    return true;
} 

// connect db
beforeAll(async () => {
    mongoose.connect(
        'mongodb://localhost/dgnt',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
          useFindAndModify: false,
        },
        (err) => {
        //   console.log(err || "Database connected!");
        }
      );
});

afterAll(async () => {
    mongoose.connection.close()
});

describe("TC_UT_ThemNVL_002", () => {
    it("Trường hợp Thêm nguyên vật liệu không thành công khi tên NVL để trống: mName.length == 0", () => {
        let input = '';
        let expected_output = false;
        expect(length_name(input)).toEqual(expected_output);
    });
});

describe("TC_UT_ThemNVL_003", () => {
    it("Trường hợp Thêm nguyên vật liệu không thành công khi tên NVL > 50 ký tự:  mName.length > 50", () => {
        let input = 'LUKNHhnJGDKJvDxGTvKmQtjacjNYpWfHhuRqtHNHZGUWVmJuRPP';
        let expected_output = false;
        expect(length_name_50(input)).toEqual(expected_output);
    });
});

describe("TC_UT_ThemNVL_004", () => {
    it("Trường hợp Thêm nguyên vật liệu không thành công khi tên NVL đã tồn tại: mName == mFound.mName", async () => {
        let input = 'nvl21';
        let expected_output = false;
        let mFound = await Material.findOne({mName: input});
        let res = (mFound?.mName == input) ? false : true
        expect(res).toEqual(expected_output);
    });
});

describe("TC_UT_ThemNVL_005", () => {
    it("Trường hợp Thêm nguyên vật liệu không thành công khi mô tả > 255 ký tự: mDesc.length > 255", () => {
        let input = '1n7vhPbz4c9CCgHENmS9pTVaQq4LrfZnR8FVGNFgu7XbtECneP6WKfMLftzbMCkZYftS3VJJDwyqpeTKqThr8nzv46B4WpY44AhYyWYZFiwwExCXx3af3NvVhCZUtXVXefGBZ4pSRj5TmQXymf2mx69qmWRE9BMLEgpMcw3QEmqfBCmtPKX5Zve5ZVSSXXjaQUKmnMdimWyccr4YFqhkHdrDFPNCFkTn7tNajMq8GHd6pAC7PHSTqBu9WYd2C5y3';
        let expected_output = false;
        expect(length_Desc_255(input)).toEqual(expected_output);
    });
});

describe("TC_UT_ThemNVL_006", () => {
    it("Trường hợp Thêm nguyên vật liệu không thành công khi đơn vị tính để trống: mUnit.length == 0", () => {
        let input = '';
        let expected_output = false;
        expect(length_unit(input)).toEqual(expected_output);
    });
});

describe("TC_UT_ThemNVL_007", () => {
    it("Trường hợp Thêm nguyên vật liệu không thành công khi !req.filename.match(/\.(jpg|jpeg|png)$/i)", () => {
        let input = 'img.gif';
        let expected_output = false;
        expect(match_img(input)).toEqual(expected_output);
    });
});
