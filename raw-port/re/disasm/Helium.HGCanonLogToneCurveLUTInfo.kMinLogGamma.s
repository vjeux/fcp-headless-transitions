__ZN26HGCanonLogToneCurveLUTInfo12kMinLogGammaEv:
00000000001138e0	movzbl	__ZGVZN26HGCanonLogToneCurveLUTInfo12kMinLogGammaEvE12kMinLogGamma(%rip), %eax ## guard variable for HGCanonLogToneCurveLUTInfo::kMinLogGamma()::kMinLogGamma
00000000001138e7	testb	%al, %al
00000000001138e9	je	0x1138f4
00000000001138eb	movsd	__ZZN26HGCanonLogToneCurveLUTInfo12kMinLogGammaEvE12kMinLogGamma(%rip), %xmm0 ## HGCanonLogToneCurveLUTInfo::kMinLogGamma()::kMinLogGamma
00000000001138f3	retq
00000000001138f4	pushq	%rbp
00000000001138f5	movq	%rsp, %rbp
00000000001138f8	callq	__ZN26HGCanonLogToneCurveLUTInfo12kMinLogGammaEv.cold.1 ## HGCanonLogToneCurveLUTInfo::kMinLogGamma() (.cold.1)
00000000001138fd	popq	%rbp
00000000001138fe	movsd	__ZZN26HGCanonLogToneCurveLUTInfo12kMinLogGammaEvE12kMinLogGamma(%rip), %xmm0 ## HGCanonLogToneCurveLUTInfo::kMinLogGamma()::kMinLogGamma
0000000000113906	retq
0000000000113907	nopw	(%rax,%rax)
