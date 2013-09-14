//エイリアスの設定
jsml.setAlias("./tests/pathSample", "testalias");

//設定したパスに置かれているモジュールの読み込み
jsml.require(["testalias.dependence_mod_1"], function()
{
	describe('[TEST] dependence', function()
	{
	    it('外部モジュールが依存しているモジュールを暗黙的に読み込むことができる', function() {
            expect(jsml.modules["testalias.dependence_mod_1"]).toBe("dependence1 module data here");

			//※testalias.dependence_mod_1はtestalias.dependence_mod_2に依存している
			//なのでコールバックが呼ばれた際にはdependence_mod_2も読み込まれている
            expect(jsml.modules["testalias.dependence_mod_2"]).toBe("dependence2 module data here");
        });
    });
	describe('[TEST] jsml.concatScript', function()
	{
	    it('jsmlで読み込まれた全ての依存モジュールを結合することができる', function() {
	    	jsml.concatScript();
        });
    });
});