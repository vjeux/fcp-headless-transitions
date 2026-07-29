
/tmp/Helium.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

00000000000fbcf0 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE>:
   fbcf0: 55                           	pushq	%rbp
   fbcf1: 48 89 e5                     	movq	%rsp, %rbp
   fbcf4: 41 57                        	pushq	%r15
   fbcf6: 41 56                        	pushq	%r14
   fbcf8: 41 55                        	pushq	%r13
   fbcfa: 41 54                        	pushq	%r12
   fbcfc: 53                           	pushq	%rbx
   fbcfd: 48 83 ec 28                  	subq	$0x28, %rsp
   fbd01: 45 89 c7                     	movl	%r8d, %r15d
   fbd04: 89 4d c0                     	movl	%ecx, -0x40(%rbp)
   fbd07: 41 89 d4                     	movl	%edx, %r12d
   fbd0a: 41 89 f5                     	movl	%esi, %r13d
   fbd0d: 48 89 fb                     	movq	%rdi, %rbx
   fbd10: e8 7b 0b 02 00               	callq	0x11c890 <__ZN6HGNode9ClearBitsEv>
   fbd15: c6 83 e9 02 00 00 01         	movb	$0x1, 0x2e9(%rbx)
   fbd1c: 45 89 ed                     	movl	%r13d, %r13d
   fbd1f: 49 c1 e5 06                  	shlq	$0x6, %r13
   fbd23: 4c 8d 35 06 3e 2d 00         	leaq	0x2d3e06(%rip), %r14    ## 0x3cfb30 <__ZN12HGColorGamma10YCbCrToRGBE>
   fbd2a: 48 89 df                     	movq	%rbx, %rdi
   fbd2d: e8 5e 0b 02 00               	callq	0x11c890 <__ZN6HGNode9ClearBitsEv>
   fbd32: c6 83 e9 02 00 00 01         	movb	$0x1, 0x2e9(%rbx)
   fbd39: 43 0f 28 44 35 00            	movaps	(%r13,%r14), %xmm0
   fbd3f: 43 0f 28 4c 35 10            	movaps	0x10(%r13,%r14), %xmm1
   fbd45: 43 0f 28 54 35 20            	movaps	0x20(%r13,%r14), %xmm2
   fbd4b: 0f 29 83 80 03 00 00         	movaps	%xmm0, 0x380(%rbx)
   fbd52: 0f 29 8b 90 03 00 00         	movaps	%xmm1, 0x390(%rbx)
   fbd59: 0f 29 93 a0 03 00 00         	movaps	%xmm2, 0x3a0(%rbx)
   fbd60: 0f 28 05 79 e2 2c 00         	movaps	0x2ce279(%rip), %xmm0   ## 0x3c9fe0 <__ZTS13HGInvertAlpha+0x30>
   fbd67: 0f 29 83 b0 03 00 00         	movaps	%xmm0, 0x3b0(%rbx)
   fbd6e: 48 89 df                     	movq	%rbx, %rdi
   fbd71: e8 1a 0b 02 00               	callq	0x11c890 <__ZN6HGNode9ClearBitsEv>
   fbd76: c6 83 e9 02 00 00 01         	movb	$0x1, 0x2e9(%rbx)
   fbd7d: c7 83 04 04 00 00 05 00 00 00	movl	$0x5, 0x404(%rbx)
   fbd87: 44 89 a3 08 04 00 00         	movl	%r12d, 0x408(%rbx)
   fbd8e: 66 0f 28 05 aa be 2c 00      	movapd	0x2cbeaa(%rip), %xmm0   ## 0x3c7c40 <__ZTS12HGParamField+0x88>
   fbd96: 66 0f 29 83 00 03 00 00      	movapd	%xmm0, 0x300(%rbx)
   fbd9e: 66 0f 57 c0                  	xorpd	%xmm0, %xmm0
   fbda2: 66 0f 29 83 10 03 00 00      	movapd	%xmm0, 0x310(%rbx)
   fbdaa: 66 0f 29 83 20 03 00 00      	movapd	%xmm0, 0x320(%rbx)
   fbdb2: 66 0f 29 83 30 03 00 00      	movapd	%xmm0, 0x330(%rbx)
   fbdba: 66 0f 29 83 40 03 00 00      	movapd	%xmm0, 0x340(%rbx)
   fbdc2: 66 0f 29 83 50 03 00 00      	movapd	%xmm0, 0x350(%rbx)
   fbdca: 66 0f 29 83 60 03 00 00      	movapd	%xmm0, 0x360(%rbx)
   fbdd2: c6 83 70 03 00 00 01         	movb	$0x1, 0x370(%rbx)
   fbdd9: 45 31 ed                     	xorl	%r13d, %r13d
   fbddc: 41 83 fc 12                  	cmpl	$0x12, %r12d
   fbde0: 0f 87 5e 02 00 00            	ja	0xfc044 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x354>
   fbde6: 44 89 e0                     	movl	%r12d, %eax
   fbde9: 48 8d 0d 5c 02 00 00         	leaq	0x25c(%rip), %rcx       ## 0xfc04c <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x35c>
   fbdf0: 48 63 04 81                  	movslq	(%rcx,%rax,4), %rax
   fbdf4: 48 01 c8                     	addq	%rcx, %rax
   fbdf7: ff e0                        	jmpq	*%rax
   fbdf9: 48 8d 05 90 8f 2d 00         	leaq	0x2d8f90(%rip), %rax    ## 0x3d4d90 <__ZN33HGArriLogCDefaultToneCurveLUTInfo12kMinLogGammaE>
   fbe00: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbe04: 48 8d 05 8d 8f 2d 00         	leaq	0x2d8f8d(%rip), %rax    ## 0x3d4d98 <__ZN33HGArriLogCDefaultToneCurveLUTInfo12kMaxLogGammaE>
   fbe0b: e9 69 01 00 00               	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbe10: 48 8d 05 f9 95 2d 00         	leaq	0x2d95f9(%rip), %rax    ## 0x3d5410 <__ZN29HGBMDFilmLinearizationLUTInfo12kMinLogGammaE>
   fbe17: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbe1b: 48 8d 05 f6 95 2d 00         	leaq	0x2d95f6(%rip), %rax    ## 0x3d5418 <__ZN29HGBMDFilmLinearizationLUTInfo12kMaxLogGammaE>
   fbe22: e9 52 01 00 00               	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbe27: 48 8d 05 1a 97 2d 00         	leaq	0x2d971a(%rip), %rax    ## 0x3d5548 <__ZN29HGDJIDLogLinearizationLUTInfo12kMinLogGammaE>
   fbe2e: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbe32: 48 8d 05 17 97 2d 00         	leaq	0x2d9717(%rip), %rax    ## 0x3d5550 <__ZN29HGDJIDLogLinearizationLUTInfo12kMaxLogGammaE>
   fbe39: e9 3b 01 00 00               	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbe3e: 48 8d 05 2b 96 2d 00         	leaq	0x2d962b(%rip), %rax    ## 0x3d5470 <__ZN33HGBMDFilmGen5LinearizationLUTInfo12kMinLogGammaE>
   fbe45: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbe49: 48 8d 05 28 96 2d 00         	leaq	0x2d9628(%rip), %rax    ## 0x3d5478 <__ZN33HGBMDFilmGen5LinearizationLUTInfo12kMaxLogGammaE>
   fbe50: e9 24 01 00 00               	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbe55: 48 8d 05 2c 95 2d 00         	leaq	0x2d952c(%rip), %rax    ## 0x3d5388 <__ZN31HGNikonNLogLinearizationLUTInfo12kMinLogGammaE>
   fbe5c: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbe60: 48 8d 05 29 95 2d 00         	leaq	0x2d9529(%rip), %rax    ## 0x3d5390 <__ZN31HGNikonNLogLinearizationLUTInfo12kMaxLogGammaE>
   fbe67: e9 0d 01 00 00               	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbe6c: e8 6f 7a 01 00               	callq	0x1138e0 <__ZN26HGCanonLogToneCurveLUTInfo12kMinLogGammaEv>
   fbe71: 66 0f 29 45 b0               	movapd	%xmm0, -0x50(%rbp)
   fbe76: e8 95 7a 01 00               	callq	0x113910 <__ZN26HGCanonLogToneCurveLUTInfo12kMaxLogGammaEv>
   fbe7b: 66 0f 28 4d b0               	movapd	-0x50(%rbp), %xmm1
   fbe80: e9 f8 00 00 00               	jmp	0xfbf7d <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x28d>
   fbe85: 48 8d 05 34 94 2d 00         	leaq	0x2d9434(%rip), %rax    ## 0x3d52c0 <__ZN31HGSonySLog3LinearizationLUTInfo12kMinLogGammaE>
   fbe8c: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbe90: 48 8d 05 31 94 2d 00         	leaq	0x2d9431(%rip), %rax    ## 0x3d52c8 <__ZN31HGSonySLog3LinearizationLUTInfo12kMaxLogGammaE>
   fbe97: e9 dd 00 00 00               	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbe9c: 48 8d 05 9d 91 2d 00         	leaq	0x2d919d(%rip), %rax    ## 0x3d5040 <__ZN30HGArriLogCLinearizationLUTInfo12kMinLogGammaE>
   fbea3: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbea7: 48 8d 05 9a 91 2d 00         	leaq	0x2d919a(%rip), %rax    ## 0x3d5048 <__ZN30HGArriLogCLinearizationLUTInfo12kMaxLogGammaE>
   fbeae: e9 c6 00 00 00               	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbeb3: 48 8d 05 1e 96 2d 00         	leaq	0x2d961e(%rip), %rax    ## 0x3d54d8 <__ZN30HGAppleLogLinearizationLUTInfo12kMinLogGammaE>
   fbeba: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbebe: 48 8d 05 1b 96 2d 00         	leaq	0x2d961b(%rip), %rax    ## 0x3d54e0 <__ZN30HGAppleLogLinearizationLUTInfo12kMaxLogGammaE>
   fbec5: e9 af 00 00 00               	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbeca: 48 8d 05 bf 91 2d 00         	leaq	0x2d91bf(%rip), %rax    ## 0x3d5090 <__ZN31HGArriLogC4LinearizationLUTInfo12kMinLogGammaE>
   fbed1: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbed5: 48 8d 05 bc 91 2d 00         	leaq	0x2d91bc(%rip), %rax    ## 0x3d5098 <__ZN31HGArriLogC4LinearizationLUTInfo12kMaxLogGammaE>
   fbedc: f2 0f 10 00                  	movsd	(%rax), %xmm0
   fbee0: 48 8d 05 b9 91 2d 00         	leaq	0x2d91b9(%rip), %rax    ## 0x3d50a0 <__ZN31HGArriLogC4LinearizationLUTInfo8kNumBinsE>
   fbee7: 44 8b 28                     	movl	(%rax), %r13d
   fbeea: e9 8e 00 00 00               	jmp	0xfbf7d <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x28d>
   fbeef: 48 8d 05 f2 92 2d 00         	leaq	0x2d92f2(%rip), %rax    ## 0x3d51e8 <__ZN31HGCanonLog3LinearizationLUTInfo12kMinLogGammaE>
   fbef6: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbefa: 48 8d 05 ef 92 2d 00         	leaq	0x2d92ef(%rip), %rax    ## 0x3d51f0 <__ZN31HGCanonLog3LinearizationLUTInfo12kMaxLogGammaE>
   fbf01: eb 76                        	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbf03: 48 8d 05 a6 96 2d 00         	leaq	0x2d96a6(%rip), %rax    ## 0x3d55b0 <__ZN34HGFujifilmFLogLinearizationLUTInfo12kMinLogGammaE>
   fbf0a: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbf0e: 48 8d 05 a3 96 2d 00         	leaq	0x2d96a3(%rip), %rax    ## 0x3d55b8 <__ZN34HGFujifilmFLogLinearizationLUTInfo12kMaxLogGammaE>
   fbf15: eb 62                        	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbf17: 48 8d 05 0a 92 2d 00         	leaq	0x2d920a(%rip), %rax    ## 0x3d5128 <__ZN30HGCanonLogLinearizationLUTInfo12kMinLogGammaE>
   fbf1e: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbf22: 48 8d 05 07 92 2d 00         	leaq	0x2d9207(%rip), %rax    ## 0x3d5130 <__ZN30HGCanonLogLinearizationLUTInfo12kMaxLogGammaE>
   fbf29: eb 4e                        	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbf2b: 48 8d 05 46 92 2d 00         	leaq	0x2d9246(%rip), %rax    ## 0x3d5178 <__ZN31HGCanonLog2LinearizationLUTInfo12kMinLogGammaE>
   fbf32: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbf36: 48 8d 05 43 92 2d 00         	leaq	0x2d9243(%rip), %rax    ## 0x3d5180 <__ZN31HGCanonLog2LinearizationLUTInfo12kMaxLogGammaE>
   fbf3d: eb 3a                        	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbf3f: 48 8d 05 e2 93 2d 00         	leaq	0x2d93e2(%rip), %rax    ## 0x3d5328 <__ZN35HGPanasonicVLogLinearizationLUTInfo12kMinLogGammaE>
   fbf46: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbf4a: 48 8d 05 df 93 2d 00         	leaq	0x2d93df(%rip), %rax    ## 0x3d5330 <__ZN35HGPanasonicVLogLinearizationLUTInfo12kMaxLogGammaE>
   fbf51: eb 26                        	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbf53: 48 8d 05 fe 92 2d 00         	leaq	0x2d92fe(%rip), %rax    ## 0x3d5258 <__ZN31HGSonySLog2LinearizationLUTInfo12kMinLogGammaE>
   fbf5a: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbf5e: 48 8d 05 fb 92 2d 00         	leaq	0x2d92fb(%rip), %rax    ## 0x3d5260 <__ZN31HGSonySLog2LinearizationLUTInfo12kMaxLogGammaE>
   fbf65: eb 12                        	jmp	0xfbf79 <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x289>
   fbf67: 48 8d 05 b2 96 2d 00         	leaq	0x2d96b2(%rip), %rax    ## 0x3d5620 <__ZN35HGFujifilmFLog2LinearizationLUTInfo12kMinLogGammaE>
   fbf6e: f2 0f 10 08                  	movsd	(%rax), %xmm1
   fbf72: 48 8d 05 af 96 2d 00         	leaq	0x2d96af(%rip), %rax    ## 0x3d5628 <__ZN35HGFujifilmFLog2LinearizationLUTInfo12kMaxLogGammaE>
   fbf79: f2 0f 10 00                  	movsd	(%rax), %xmm0
   fbf7d: 44 8b 75 c0                  	movl	-0x40(%rbp), %r14d
   fbf81: 66 0f 29 4d b0               	movapd	%xmm1, -0x50(%rbp)
   fbf86: f2 0f 5c c1                  	subsd	%xmm1, %xmm0
   fbf8a: 66 0f 29 45 c0               	movapd	%xmm0, -0x40(%rbp)
   fbf8f: 48 89 df                     	movq	%rbx, %rdi
   fbf92: e8 f9 08 02 00               	callq	0x11c890 <__ZN6HGNode9ClearBitsEv>
   fbf97: c6 83 e9 02 00 00 01         	movb	$0x1, 0x2e9(%rbx)
   fbf9e: 66 0f 28 45 c0               	movapd	-0x40(%rbp), %xmm0
   fbfa3: 66 0f 14 45 b0               	unpcklpd	-0x50(%rbp), %xmm0      ## xmm0 = xmm0[0],mem[0]
   fbfa8: 66 0f 5a c0                  	cvtpd2ps	%xmm0, %xmm0
   fbfac: 66 0f 13 83 84 04 00 00      	movlpd	%xmm0, 0x484(%rbx)
   fbfb4: 45 85 ed                     	testl	%r13d, %r13d
   fbfb7: 74 16                        	je	0xfbfcf <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x2df>
   fbfb9: 48 89 df                     	movq	%rbx, %rdi
   fbfbc: e8 cf 08 02 00               	callq	0x11c890 <__ZN6HGNode9ClearBitsEv>
   fbfc1: c6 83 e9 02 00 00 01         	movb	$0x1, 0x2e9(%rbx)
   fbfc8: 44 89 ab 80 04 00 00         	movl	%r13d, 0x480(%rbx)
   fbfcf: 45 89 f6                     	movl	%r14d, %r14d
   fbfd2: 49 c1 e6 06                  	shlq	$0x6, %r14
   fbfd6: 41 83 ff 03                  	cmpl	$0x3, %r15d
   fbfda: 48 8d 05 cf 3d 2d 00         	leaq	0x2d3dcf(%rip), %rax    ## 0x3cfdb0 <__ZN12HGColorGamma23logGamutRGBToRec2020RGBE>
   fbfe1: 4c 8d 3d c8 41 2d 00         	leaq	0x2d41c8(%rip), %r15    ## 0x3d01b0 <__ZN12HGColorGamma22logGamutRGBToRec709RGBE>
   fbfe8: 4c 0f 44 f8                  	cmoveq	%rax, %r15
   fbfec: 48 89 df                     	movq	%rbx, %rdi
   fbfef: e8 9c 08 02 00               	callq	0x11c890 <__ZN6HGNode9ClearBitsEv>
   fbff4: c6 83 e9 02 00 00 01         	movb	$0x1, 0x2e9(%rbx)
   fbffb: 43 0f 28 04 37               	movaps	(%r15,%r14), %xmm0
   fc000: 43 0f 28 4c 37 10            	movaps	0x10(%r15,%r14), %xmm1
   fc006: 43 0f 28 54 37 20            	movaps	0x20(%r15,%r14), %xmm2
   fc00c: 43 0f 28 5c 37 30            	movaps	0x30(%r15,%r14), %xmm3
   fc012: 0f 29 83 c0 03 00 00         	movaps	%xmm0, 0x3c0(%rbx)
   fc019: 0f 29 8b d0 03 00 00         	movaps	%xmm1, 0x3d0(%rbx)
   fc020: 0f 29 93 e0 03 00 00         	movaps	%xmm2, 0x3e0(%rbx)
   fc027: 0f 29 9b f0 03 00 00         	movaps	%xmm3, 0x3f0(%rbx)
   fc02e: 48 89 df                     	movq	%rbx, %rdi
   fc031: 48 83 c4 28                  	addq	$0x28, %rsp
   fc035: 5b                           	popq	%rbx
   fc036: 41 5c                        	popq	%r12
   fc038: 41 5d                        	popq	%r13
   fc03a: 41 5e                        	popq	%r14
   fc03c: 41 5f                        	popq	%r15
   fc03e: 5d                           	popq	%rbp
   fc03f: e9 9c f3 ff ff               	jmp	0xfb3e0 <__ZN12HGColorGamma20SetYCbCrBiasAndScaleEv>
   fc044: e9 34 ff ff ff               	jmp	0xfbf7d <__ZN12HGColorGamma13SetConversionENS_30hgColorGammaMatrixCoefficientsENS_20hgColorGammaLogCurveENS_20hgColorGammaLogGamutENS_26hgColorGammaColorPrimariesE+0x28d>
   fc049: 0f 1f 00                     	nopl	(%rax)
   fc04c: ad                           	lodsl	(%rsi), %eax
   fc04d: fd                           	std
   fc04e: ff ff                        	<unknown>
   fc050: ad                           	lodsl	(%rsi), %eax
   fc051: fd                           	std
   fc052: ff ff                        	<unknown>
   fc054: 50                           	pushq	%rax
   fc055: fe ff                        	<unknown>
   fc057: ff 7e fe                     	<unknown>
   fc05a: ff ff                        	<unknown>
   fc05c: 20 fe                        	andb	%bh, %dh
   fc05e: ff ff                        	<unknown>
   fc060: cb                           	lretl
   fc061: fe ff                        	<unknown>
   fc063: ff df                        	<unknown>
   fc065: fe ff                        	<unknown>
   fc067: ff a3 fe ff ff 07            	jmpq	*0x7fffffe(%rbx)
   fc06d: ff ff                        	<unknown>
   fc06f: ff 39                        	<unknown>
   fc071: fe ff                        	<unknown>
   fc073: ff f3                        	pushq	%rbx
   fc075: fe ff                        	<unknown>
   fc077: ff 09                        	decl	(%rcx)
   fc079: fe ff                        	<unknown>
   fc07b: ff c4                        	incl	%esp
   fc07d: fd                           	std
   fc07e: ff ff                        	<unknown>
   fc080: c4 fd ff                     	<unknown>
   fc083: ff f2                        	pushq	%rdx
   fc085: fd                           	std
   fc086: ff ff                        	<unknown>
   fc088: 67 fe ff                     	<unknown>
   fc08b: ff db                        	<unknown>
   fc08d: fd                           	std
   fc08e: ff ff                        	<unknown>
   fc090: b7 fe                        	movb	$-0x2, %bh
   fc092: ff ff                        	<unknown>
   fc094: 1b ff                        	sbbl	%edi, %edi
   fc096: ff ff                        	<unknown>
   fc098: 0f 1f 84 00 00 00 00 00      	nopl	(%rax,%rax)
