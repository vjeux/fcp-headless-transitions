__ZN26HGCanonLogToneCurveLUTInfo12kMaxLogGammaEv:
0000000000113910	pushq	%rbp
0000000000113911	movq	%rsp, %rbp
0000000000113914	movzbl	__ZGVZN26HGCanonLogToneCurveLUTInfo12kMaxLogGammaEvE15kMaxSceneLinear(%rip), %eax ## guard variable for HGCanonLogToneCurveLUTInfo::kMaxLogGamma()::kMaxSceneLinear
000000000011391b	testb	%al, %al
000000000011391d	je	0x113934
000000000011391f	movzbl	__ZGVZN26HGCanonLogToneCurveLUTInfo12kMaxLogGammaEvE12kMaxLogGamma(%rip), %eax ## guard variable for HGCanonLogToneCurveLUTInfo::kMaxLogGamma()::kMaxLogGamma
0000000000113926	testb	%al, %al
0000000000113928	je	0x113944
000000000011392a	movsd	__ZZN26HGCanonLogToneCurveLUTInfo12kMaxLogGammaEvE12kMaxLogGamma(%rip), %xmm0 ## HGCanonLogToneCurveLUTInfo::kMaxLogGamma()::kMaxLogGamma
0000000000113932	popq	%rbp
0000000000113933	retq
0000000000113934	callq	__ZN26HGCanonLogToneCurveLUTInfo12kMaxLogGammaEv.cold.1 ## HGCanonLogToneCurveLUTInfo::kMaxLogGamma() (.cold.1)
0000000000113939	movzbl	__ZGVZN26HGCanonLogToneCurveLUTInfo12kMaxLogGammaEvE12kMaxLogGamma(%rip), %eax ## guard variable for HGCanonLogToneCurveLUTInfo::kMaxLogGamma()::kMaxLogGamma
0000000000113940	testb	%al, %al
0000000000113942	jne	0x11392a
0000000000113944	callq	__ZN26HGCanonLogToneCurveLUTInfo12kMaxLogGammaEv.cold.2 ## HGCanonLogToneCurveLUTInfo::kMaxLogGamma() (.cold.2)
0000000000113949	movsd	__ZZN26HGCanonLogToneCurveLUTInfo12kMaxLogGammaEvE12kMaxLogGamma(%rip), %xmm0 ## HGCanonLogToneCurveLUTInfo::kMaxLogGamma()::kMaxLogGamma
0000000000113951	popq	%rbp
0000000000113952	retq
0000000000113953	nopw	%cs:(%rax,%rax)
