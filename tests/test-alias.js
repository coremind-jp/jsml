//エイリアスの設定
jsml.setAlias("./tests/pathSample", "testalias");

//設定したパスに置かれているモジュールの読み込み
jsml.require(["testalias.alias_mod"], function()
{
    describe('[TEST] jsml.setAlias, jsml.require, jsml.exports', function()
    {
        it('パッケージルートとなるパスにエイリアスを設定し外部モジュールを読み込むことができる', function() {
            expect(jsml.modules["testalias.alias_mod"]).toBe("alias module data here");
        });
    });
});