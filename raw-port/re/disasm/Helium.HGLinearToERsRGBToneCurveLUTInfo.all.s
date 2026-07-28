__ZN32HGLinearToERsRGBToneCurveLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE:
0000000000115430	pushq	%rbp
0000000000115431	movq	%rsp, %rbp
0000000000115434	pushq	%rbx
0000000000115435	pushq	%rax
0000000000115436	movl	%edx, %ecx
0000000000115438	movq	%rdi, %rbx
000000000011543b	movl	$0x1, %edx
0000000000115440	callq	__ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE ## HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
0000000000115445	leaq	0x907cfc(%rip), %rax
000000000011544c	movq	%rax, (%rbx)
000000000011544f	addq	$0x8, %rsp
0000000000115453	popq	%rbx
0000000000115454	popq	%rbp
0000000000115455	retq
0000000000115456	nopw	%cs:(%rax,%rax)
__ZNK32HGLinearToERsRGBToneCurveLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
0000000000115460	pushq	%rbp
0000000000115461	movq	%rsp, %rbp
0000000000115464	pushq	%rbx
0000000000115465	pushq	%rax
0000000000115466	testq	%rsi, %rsi
0000000000115469	je	0x11549f
000000000011546b	movq	%rdi, %rbx
000000000011546e	movq	0x8ece6b(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
0000000000115475	leaq	__ZTI32HGLinearToERsRGBToneCurveLUTInfo(%rip), %rdx ## typeinfo for HGLinearToERsRGBToneCurveLUTInfo
000000000011547c	movq	%rsi, %rdi
000000000011547f	movq	%rax, %rsi
0000000000115482	xorl	%ecx, %ecx
0000000000115484	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000115489	testq	%rax, %rax
000000000011548c	je	0x11549f
000000000011548e	movq	%rbx, %rdi
0000000000115491	movq	%rax, %rsi
0000000000115494	addq	$0x8, %rsp
0000000000115498	popq	%rbx
0000000000115499	popq	%rbp
000000000011549a	jmp	__ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE ## HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
000000000011549f	xorl	%eax, %eax
00000000001154a1	addq	$0x8, %rsp
00000000001154a5	popq	%rbx
00000000001154a6	popq	%rbp
00000000001154a7	retq
00000000001154a8	nopl	(%rax,%rax)
__ZNK32HGLinearToERsRGBToneCurveLUTInfo12colorAtIndexEfffPfS0_S0_S0_:
00000000001154b0	pushq	%rbp
00000000001154b1	movq	%rsp, %rbp
00000000001154b4	pushq	%r15
00000000001154b6	pushq	%r14
00000000001154b8	pushq	%r12
00000000001154ba	pushq	%rbx
00000000001154bb	subq	$0x10, %rsp
00000000001154bf	movq	%r8, %rbx
00000000001154c2	movq	%rcx, %r14
00000000001154c5	movq	%rdx, %r15
00000000001154c8	movq	%rsi, %r12
00000000001154cb	movaps	%xmm0, %xmm3
00000000001154ce	movaps	0x2b275b(%rip), %xmm2
00000000001154d5	andps	%xmm0, %xmm2
00000000001154d8	movss	0x2b4dd0(%rip), %xmm0
00000000001154e0	ucomiss	%xmm2, %xmm0
00000000001154e3	jbe	0x1154f3
00000000001154e5	movss	0x2b4d7f(%rip), %xmm1
00000000001154ed	mulss	%xmm2, %xmm1
00000000001154f1	jmp	0x11551f
00000000001154f3	movss	0x2bf509(%rip), %xmm0
00000000001154fb	mulss	%xmm2, %xmm0
00000000001154ff	movss	0x2bf501(%rip), %xmm1
0000000000115507	movaps	%xmm3, -0x30(%rbp)
000000000011550b	callq	0x3c54f2                        ## symbol stub for: _powf
0000000000115510	movaps	-0x30(%rbp), %xmm3
0000000000115514	movaps	%xmm0, %xmm1
0000000000115517	addss	0x2b4d99(%rip), %xmm1
000000000011551f	movaps	0x2b4baa(%rip), %xmm2
0000000000115526	xorps	%xmm1, %xmm2
0000000000115529	xorps	%xmm0, %xmm0
000000000011552c	cmpltss	%xmm0, %xmm3
0000000000115531	movaps	%xmm3, %xmm0
0000000000115534	blendvps	%xmm0, %xmm2, %xmm1
0000000000115539	movss	%xmm1, (%r12)
000000000011553f	movss	%xmm1, (%r15)
0000000000115544	movss	%xmm1, (%r14)
0000000000115549	movl	$0x3f800000, (%rbx)             ## imm = 0x3F800000
000000000011554f	addq	$0x10, %rsp
0000000000115553	popq	%rbx
0000000000115554	popq	%r12
0000000000115556	popq	%r14
0000000000115558	popq	%r15
000000000011555a	popq	%rbp
000000000011555b	retq
000000000011555c	nopl	(%rax)
__ZN19HGColorGammaLUTInfoD1Ev:
0000000000115560	pushq	%rbp
0000000000115561	movq	%rsp, %rbp
0000000000115564	popq	%rbp
0000000000115565	retq
0000000000115566	nopw	%cs:(%rax,%rax)
__ZN19HGColorGammaLUTInfoD0Ev:
0000000000115570	pushq	%rbp
0000000000115571	movq	%rsp, %rbp
0000000000115574	popq	%rbp
0000000000115575	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000011557a	nopw	(%rax,%rax)
__ZNK19HGColorGammaLUTInfo9duplicateEv:
0000000000115580	pushq	%rbp
0000000000115581	movq	%rsp, %rbp
0000000000115584	pushq	%rbx
0000000000115585	pushq	%rax
0000000000115586	movq	%rdi, %rbx
0000000000115589	movl	$0x80, %edi
000000000011558e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115593	movups	0x8(%rbx), %xmm0
0000000000115597	movups	0x14(%rbx), %xmm1
000000000011559b	movups	%xmm0, 0x8(%rax)
000000000011559f	movups	%xmm1, 0x14(%rax)
00000000001155a3	leaq	0x90750e(%rip), %rcx
00000000001155aa	movq	%rcx, (%rax)
00000000001155ad	movups	0x24(%rbx), %xmm0
00000000001155b1	movups	0x34(%rbx), %xmm1
00000000001155b5	movups	0x44(%rbx), %xmm2
00000000001155b9	movups	0x54(%rbx), %xmm3
00000000001155bd	movups	%xmm0, 0x24(%rax)
00000000001155c1	movups	%xmm1, 0x34(%rax)
00000000001155c5	movups	%xmm2, 0x44(%rax)
00000000001155c9	movups	%xmm3, 0x54(%rax)
00000000001155cd	movups	0x64(%rbx), %xmm0
00000000001155d1	movups	%xmm0, 0x64(%rax)
00000000001155d5	movq	0x74(%rbx), %rcx
00000000001155d9	movq	%rcx, 0x74(%rax)
00000000001155dd	addq	$0x8, %rsp
00000000001155e1	popq	%rbx
00000000001155e2	popq	%rbp
00000000001155e3	retq
00000000001155e4	nopw	%cs:(%rax,%rax)
__ZN33HGArriLogCDefaultToneCurveLUTInfoD1Ev:
00000000001155f0	pushq	%rbp
00000000001155f1	movq	%rsp, %rbp
00000000001155f4	popq	%rbp
00000000001155f5	retq
00000000001155f6	nopw	%cs:(%rax,%rax)
__ZN33HGArriLogCDefaultToneCurveLUTInfoD0Ev:
0000000000115600	pushq	%rbp
0000000000115601	movq	%rsp, %rbp
0000000000115604	popq	%rbp
0000000000115605	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000011560a	nopw	(%rax,%rax)
__ZNK33HGArriLogCDefaultToneCurveLUTInfo9duplicateEv:
0000000000115610	pushq	%rbp
0000000000115611	movq	%rsp, %rbp
0000000000115614	pushq	%rbx
0000000000115615	pushq	%rax
0000000000115616	movq	%rdi, %rbx
0000000000115619	movl	$0x80, %edi
000000000011561e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115623	movups	0x8(%rbx), %xmm0
0000000000115627	movups	0x14(%rbx), %xmm1
000000000011562b	movups	%xmm0, 0x8(%rax)
000000000011562f	movups	%xmm1, 0x14(%rax)
0000000000115633	leaq	0x9074ce(%rip), %rcx
000000000011563a	movq	%rcx, (%rax)
000000000011563d	movups	0x28(%rbx), %xmm0
0000000000115641	movups	0x38(%rbx), %xmm1
0000000000115645	movups	0x48(%rbx), %xmm2
0000000000115649	movups	0x58(%rbx), %xmm3
000000000011564d	movups	%xmm0, 0x28(%rax)
0000000000115651	movups	%xmm1, 0x38(%rax)
0000000000115655	movups	%xmm2, 0x48(%rax)
0000000000115659	movups	%xmm3, 0x58(%rax)
000000000011565d	movups	0x68(%rbx), %xmm0
0000000000115661	movups	%xmm0, 0x68(%rax)
0000000000115665	movzbl	0x78(%rbx), %ecx
0000000000115669	movb	%cl, 0x78(%rax)
000000000011566c	addq	$0x8, %rsp
0000000000115670	popq	%rbx
0000000000115671	popq	%rbp
0000000000115672	retq
0000000000115673	nopw	%cs:(%rax,%rax)
__ZN30HGArriLogCLinearizationLUTInfoD1Ev:
0000000000115680	pushq	%rbp
0000000000115681	movq	%rsp, %rbp
0000000000115684	popq	%rbp
0000000000115685	retq
0000000000115686	nopw	%cs:(%rax,%rax)
__ZN30HGArriLogCLinearizationLUTInfoD0Ev:
0000000000115690	pushq	%rbp
0000000000115691	movq	%rsp, %rbp
0000000000115694	popq	%rbp
0000000000115695	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000011569a	nopw	(%rax,%rax)
__ZNK30HGArriLogCLinearizationLUTInfo9duplicateEv:
00000000001156a0	pushq	%rbp
00000000001156a1	movq	%rsp, %rbp
00000000001156a4	pushq	%rbx
00000000001156a5	pushq	%rax
00000000001156a6	movq	%rdi, %rbx
00000000001156a9	movl	$0x38, %edi
00000000001156ae	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001156b3	movups	0x8(%rbx), %xmm0
00000000001156b7	movups	0x14(%rbx), %xmm1
00000000001156bb	movups	%xmm0, 0x8(%rax)
00000000001156bf	movups	%xmm1, 0x14(%rax)
00000000001156c3	leaq	0x90748e(%rip), %rcx
00000000001156ca	movq	%rcx, (%rax)
00000000001156cd	movups	0x24(%rbx), %xmm0
00000000001156d1	movups	%xmm0, 0x24(%rax)
00000000001156d5	movl	0x34(%rbx), %ecx
00000000001156d8	movl	%ecx, 0x34(%rax)
00000000001156db	addq	$0x8, %rsp
00000000001156df	popq	%rbx
00000000001156e0	popq	%rbp
00000000001156e1	retq
00000000001156e2	nopw	%cs:(%rax,%rax)
__ZN31HGArriLogC4LinearizationLUTInfoD1Ev:
00000000001156f0	pushq	%rbp
00000000001156f1	movq	%rsp, %rbp
00000000001156f4	popq	%rbp
00000000001156f5	retq
00000000001156f6	nopw	%cs:(%rax,%rax)
__ZN31HGArriLogC4LinearizationLUTInfoD0Ev:
0000000000115700	pushq	%rbp
0000000000115701	movq	%rsp, %rbp
0000000000115704	popq	%rbp
0000000000115705	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000011570a	nopw	(%rax,%rax)
__ZNK31HGArriLogC4LinearizationLUTInfo9duplicateEv:
0000000000115710	pushq	%rbp
0000000000115711	movq	%rsp, %rbp
0000000000115714	pushq	%rbx
0000000000115715	pushq	%rax
0000000000115716	movq	%rdi, %rbx
0000000000115719	movl	$0x28, %edi
000000000011571e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115723	movups	0x8(%rbx), %xmm0
0000000000115727	movups	0x14(%rbx), %xmm1
000000000011572b	movups	%xmm0, 0x8(%rax)
000000000011572f	movups	%xmm1, 0x14(%rax)
0000000000115733	leaq	0x90746e(%rip), %rcx
000000000011573a	movq	%rcx, (%rax)
000000000011573d	addq	$0x8, %rsp
0000000000115741	popq	%rbx
0000000000115742	popq	%rbp
0000000000115743	retq
0000000000115744	nopw	%cs:(%rax,%rax)
__ZN26HGCanonLogToneCurveLUTInfoD1Ev:
0000000000115750	pushq	%rbp
0000000000115751	movq	%rsp, %rbp
0000000000115754	popq	%rbp
0000000000115755	retq
0000000000115756	nopw	%cs:(%rax,%rax)
__ZN26HGCanonLogToneCurveLUTInfoD0Ev:
0000000000115760	pushq	%rbp
0000000000115761	movq	%rsp, %rbp
0000000000115764	popq	%rbp
0000000000115765	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000011576a	nopw	(%rax,%rax)
__ZNK26HGCanonLogToneCurveLUTInfo9duplicateEv:
0000000000115770	pushq	%rbp
0000000000115771	movq	%rsp, %rbp
0000000000115774	pushq	%rbx
0000000000115775	pushq	%rax
0000000000115776	movq	%rdi, %rbx
0000000000115779	movl	$0x28, %edi
000000000011577e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115783	movups	0x8(%rbx), %xmm0
0000000000115787	movups	0x14(%rbx), %xmm1
000000000011578b	movups	%xmm0, 0x8(%rax)
000000000011578f	movups	%xmm1, 0x14(%rax)
0000000000115793	leaq	0x90745e(%rip), %rcx
000000000011579a	movq	%rcx, (%rax)
000000000011579d	addq	$0x8, %rsp
00000000001157a1	popq	%rbx
00000000001157a2	popq	%rbp
00000000001157a3	retq
00000000001157a4	nopw	%cs:(%rax,%rax)
__ZN30HGCanonLogLinearizationLUTInfoD1Ev:
00000000001157b0	pushq	%rbp
00000000001157b1	movq	%rsp, %rbp
00000000001157b4	popq	%rbp
00000000001157b5	retq
00000000001157b6	nopw	%cs:(%rax,%rax)
__ZN30HGCanonLogLinearizationLUTInfoD0Ev:
00000000001157c0	pushq	%rbp
00000000001157c1	movq	%rsp, %rbp
00000000001157c4	popq	%rbp
00000000001157c5	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001157ca	nopw	(%rax,%rax)
__ZNK30HGCanonLogLinearizationLUTInfo9duplicateEv:
00000000001157d0	pushq	%rbp
00000000001157d1	movq	%rsp, %rbp
00000000001157d4	pushq	%rbx
00000000001157d5	pushq	%rax
00000000001157d6	movq	%rdi, %rbx
00000000001157d9	movl	$0x28, %edi
00000000001157de	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001157e3	movups	0x8(%rbx), %xmm0
00000000001157e7	movups	0x14(%rbx), %xmm1
00000000001157eb	movups	%xmm0, 0x8(%rax)
00000000001157ef	movups	%xmm1, 0x14(%rax)
00000000001157f3	leaq	0x90744e(%rip), %rcx
00000000001157fa	movq	%rcx, (%rax)
00000000001157fd	addq	$0x8, %rsp
0000000000115801	popq	%rbx
0000000000115802	popq	%rbp
0000000000115803	retq
0000000000115804	nopw	%cs:(%rax,%rax)
__ZN31HGCanonLog2LinearizationLUTInfoD1Ev:
0000000000115810	pushq	%rbp
0000000000115811	movq	%rsp, %rbp
0000000000115814	popq	%rbp
0000000000115815	retq
0000000000115816	nopw	%cs:(%rax,%rax)
__ZN31HGCanonLog2LinearizationLUTInfoD0Ev:
0000000000115820	pushq	%rbp
0000000000115821	movq	%rsp, %rbp
0000000000115824	popq	%rbp
0000000000115825	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000011582a	nopw	(%rax,%rax)
__ZNK31HGCanonLog2LinearizationLUTInfo9duplicateEv:
0000000000115830	pushq	%rbp
0000000000115831	movq	%rsp, %rbp
0000000000115834	pushq	%rbx
0000000000115835	pushq	%rax
0000000000115836	movq	%rdi, %rbx
0000000000115839	movl	$0x28, %edi
000000000011583e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115843	movups	0x8(%rbx), %xmm0
0000000000115847	movups	0x14(%rbx), %xmm1
000000000011584b	movups	%xmm0, 0x8(%rax)
000000000011584f	movups	%xmm1, 0x14(%rax)
0000000000115853	leaq	0x90743e(%rip), %rcx
000000000011585a	movq	%rcx, (%rax)
000000000011585d	addq	$0x8, %rsp
0000000000115861	popq	%rbx
0000000000115862	popq	%rbp
0000000000115863	retq
0000000000115864	nopw	%cs:(%rax,%rax)
__ZN31HGCanonLog3LinearizationLUTInfoD1Ev:
0000000000115870	pushq	%rbp
0000000000115871	movq	%rsp, %rbp
0000000000115874	popq	%rbp
0000000000115875	retq
0000000000115876	nopw	%cs:(%rax,%rax)
__ZN31HGCanonLog3LinearizationLUTInfoD0Ev:
0000000000115880	pushq	%rbp
0000000000115881	movq	%rsp, %rbp
0000000000115884	popq	%rbp
0000000000115885	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000011588a	nopw	(%rax,%rax)
__ZNK31HGCanonLog3LinearizationLUTInfo9duplicateEv:
0000000000115890	pushq	%rbp
0000000000115891	movq	%rsp, %rbp
0000000000115894	pushq	%rbx
0000000000115895	pushq	%rax
0000000000115896	movq	%rdi, %rbx
0000000000115899	movl	$0x28, %edi
000000000011589e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001158a3	movups	0x8(%rbx), %xmm0
00000000001158a7	movups	0x14(%rbx), %xmm1
00000000001158ab	movups	%xmm0, 0x8(%rax)
00000000001158af	movups	%xmm1, 0x14(%rax)
00000000001158b3	leaq	0x90742e(%rip), %rcx
00000000001158ba	movq	%rcx, (%rax)
00000000001158bd	addq	$0x8, %rsp
00000000001158c1	popq	%rbx
00000000001158c2	popq	%rbp
00000000001158c3	retq
00000000001158c4	nopw	%cs:(%rax,%rax)
__ZN31HGSonySLog2LinearizationLUTInfoD1Ev:
00000000001158d0	pushq	%rbp
00000000001158d1	movq	%rsp, %rbp
00000000001158d4	popq	%rbp
00000000001158d5	retq
00000000001158d6	nopw	%cs:(%rax,%rax)
__ZN31HGSonySLog2LinearizationLUTInfoD0Ev:
00000000001158e0	pushq	%rbp
00000000001158e1	movq	%rsp, %rbp
00000000001158e4	popq	%rbp
00000000001158e5	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001158ea	nopw	(%rax,%rax)
__ZNK31HGSonySLog2LinearizationLUTInfo9duplicateEv:
00000000001158f0	pushq	%rbp
00000000001158f1	movq	%rsp, %rbp
00000000001158f4	pushq	%rbx
00000000001158f5	pushq	%rax
00000000001158f6	movq	%rdi, %rbx
00000000001158f9	movl	$0x28, %edi
00000000001158fe	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115903	movups	0x8(%rbx), %xmm0
0000000000115907	movups	0x14(%rbx), %xmm1
000000000011590b	movups	%xmm0, 0x8(%rax)
000000000011590f	movups	%xmm1, 0x14(%rax)
0000000000115913	leaq	0x90741e(%rip), %rcx
000000000011591a	movq	%rcx, (%rax)
000000000011591d	addq	$0x8, %rsp
0000000000115921	popq	%rbx
0000000000115922	popq	%rbp
0000000000115923	retq
0000000000115924	nopw	%cs:(%rax,%rax)
__ZN31HGSonySLog3LinearizationLUTInfoD1Ev:
0000000000115930	pushq	%rbp
0000000000115931	movq	%rsp, %rbp
0000000000115934	popq	%rbp
0000000000115935	retq
0000000000115936	nopw	%cs:(%rax,%rax)
__ZN31HGSonySLog3LinearizationLUTInfoD0Ev:
0000000000115940	pushq	%rbp
0000000000115941	movq	%rsp, %rbp
0000000000115944	popq	%rbp
0000000000115945	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000011594a	nopw	(%rax,%rax)
__ZNK31HGSonySLog3LinearizationLUTInfo9duplicateEv:
0000000000115950	pushq	%rbp
0000000000115951	movq	%rsp, %rbp
0000000000115954	pushq	%rbx
0000000000115955	pushq	%rax
0000000000115956	movq	%rdi, %rbx
0000000000115959	movl	$0x28, %edi
000000000011595e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115963	movups	0x8(%rbx), %xmm0
0000000000115967	movups	0x14(%rbx), %xmm1
000000000011596b	movups	%xmm0, 0x8(%rax)
000000000011596f	movups	%xmm1, 0x14(%rax)
0000000000115973	leaq	0x90740e(%rip), %rcx
000000000011597a	movq	%rcx, (%rax)
000000000011597d	addq	$0x8, %rsp
0000000000115981	popq	%rbx
0000000000115982	popq	%rbp
0000000000115983	retq
0000000000115984	nopw	%cs:(%rax,%rax)
__ZN35HGPanasonicVLogLinearizationLUTInfoD1Ev:
0000000000115990	pushq	%rbp
0000000000115991	movq	%rsp, %rbp
0000000000115994	popq	%rbp
0000000000115995	retq
0000000000115996	nopw	%cs:(%rax,%rax)
__ZN35HGPanasonicVLogLinearizationLUTInfoD0Ev:
00000000001159a0	pushq	%rbp
00000000001159a1	movq	%rsp, %rbp
00000000001159a4	popq	%rbp
00000000001159a5	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001159aa	nopw	(%rax,%rax)
__ZNK35HGPanasonicVLogLinearizationLUTInfo9duplicateEv:
00000000001159b0	pushq	%rbp
00000000001159b1	movq	%rsp, %rbp
00000000001159b4	pushq	%rbx
00000000001159b5	pushq	%rax
00000000001159b6	movq	%rdi, %rbx
00000000001159b9	movl	$0x28, %edi
00000000001159be	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001159c3	movups	0x8(%rbx), %xmm0
00000000001159c7	movups	0x14(%rbx), %xmm1
00000000001159cb	movups	%xmm0, 0x8(%rax)
00000000001159cf	movups	%xmm1, 0x14(%rax)
00000000001159d3	leaq	0x9073fe(%rip), %rcx
00000000001159da	movq	%rcx, (%rax)
00000000001159dd	addq	$0x8, %rsp
00000000001159e1	popq	%rbx
00000000001159e2	popq	%rbp
00000000001159e3	retq
00000000001159e4	nopw	%cs:(%rax,%rax)
__ZN31HGNikonNLogLinearizationLUTInfoD1Ev:
00000000001159f0	pushq	%rbp
00000000001159f1	movq	%rsp, %rbp
00000000001159f4	popq	%rbp
00000000001159f5	retq
00000000001159f6	nopw	%cs:(%rax,%rax)
__ZN31HGNikonNLogLinearizationLUTInfoD0Ev:
0000000000115a00	pushq	%rbp
0000000000115a01	movq	%rsp, %rbp
0000000000115a04	popq	%rbp
0000000000115a05	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000115a0a	nopw	(%rax,%rax)
__ZNK31HGNikonNLogLinearizationLUTInfo9duplicateEv:
0000000000115a10	pushq	%rbp
0000000000115a11	movq	%rsp, %rbp
0000000000115a14	pushq	%rbx
0000000000115a15	pushq	%rax
0000000000115a16	movq	%rdi, %rbx
0000000000115a19	movl	$0x28, %edi
0000000000115a1e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115a23	movups	0x8(%rbx), %xmm0
0000000000115a27	movups	0x14(%rbx), %xmm1
0000000000115a2b	movups	%xmm0, 0x8(%rax)
0000000000115a2f	movups	%xmm1, 0x14(%rax)
0000000000115a33	leaq	0x9073ee(%rip), %rcx
0000000000115a3a	movq	%rcx, (%rax)
0000000000115a3d	addq	$0x8, %rsp
0000000000115a41	popq	%rbx
0000000000115a42	popq	%rbp
0000000000115a43	retq
0000000000115a44	nopw	%cs:(%rax,%rax)
__ZN29HGBMDFilmLinearizationLUTInfoD1Ev:
0000000000115a50	pushq	%rbp
0000000000115a51	movq	%rsp, %rbp
0000000000115a54	popq	%rbp
0000000000115a55	retq
0000000000115a56	nopw	%cs:(%rax,%rax)
__ZN29HGBMDFilmLinearizationLUTInfoD0Ev:
0000000000115a60	pushq	%rbp
0000000000115a61	movq	%rsp, %rbp
0000000000115a64	popq	%rbp
0000000000115a65	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000115a6a	nopw	(%rax,%rax)
__ZNK29HGBMDFilmLinearizationLUTInfo9duplicateEv:
0000000000115a70	pushq	%rbp
0000000000115a71	movq	%rsp, %rbp
0000000000115a74	pushq	%rbx
0000000000115a75	pushq	%rax
0000000000115a76	movq	%rdi, %rbx
0000000000115a79	movl	$0x28, %edi
0000000000115a7e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115a83	movups	0x8(%rbx), %xmm0
0000000000115a87	movups	0x14(%rbx), %xmm1
0000000000115a8b	movups	%xmm0, 0x8(%rax)
0000000000115a8f	movups	%xmm1, 0x14(%rax)
0000000000115a93	leaq	0x9073de(%rip), %rcx
0000000000115a9a	movq	%rcx, (%rax)
0000000000115a9d	movzbl	0x24(%rbx), %ecx
0000000000115aa1	movb	%cl, 0x24(%rax)
0000000000115aa4	addq	$0x8, %rsp
0000000000115aa8	popq	%rbx
0000000000115aa9	popq	%rbp
0000000000115aaa	retq
0000000000115aab	nopl	(%rax,%rax)
__ZN33HGBMDFilmGen5LinearizationLUTInfoD1Ev:
0000000000115ab0	pushq	%rbp
0000000000115ab1	movq	%rsp, %rbp
0000000000115ab4	popq	%rbp
0000000000115ab5	retq
0000000000115ab6	nopw	%cs:(%rax,%rax)
__ZN33HGBMDFilmGen5LinearizationLUTInfoD0Ev:
0000000000115ac0	pushq	%rbp
0000000000115ac1	movq	%rsp, %rbp
0000000000115ac4	popq	%rbp
0000000000115ac5	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000115aca	nopw	(%rax,%rax)
__ZNK33HGBMDFilmGen5LinearizationLUTInfo9duplicateEv:
0000000000115ad0	pushq	%rbp
0000000000115ad1	movq	%rsp, %rbp
0000000000115ad4	pushq	%rbx
0000000000115ad5	pushq	%rax
0000000000115ad6	movq	%rdi, %rbx
0000000000115ad9	movl	$0x28, %edi
0000000000115ade	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115ae3	movups	0x8(%rbx), %xmm0
0000000000115ae7	movups	0x14(%rbx), %xmm1
0000000000115aeb	movups	%xmm0, 0x8(%rax)
0000000000115aef	movups	%xmm1, 0x14(%rax)
0000000000115af3	leaq	0x9073ce(%rip), %rcx
0000000000115afa	movq	%rcx, (%rax)
0000000000115afd	addq	$0x8, %rsp
0000000000115b01	popq	%rbx
0000000000115b02	popq	%rbp
0000000000115b03	retq
0000000000115b04	nopw	%cs:(%rax,%rax)
__ZN30HGAppleLogLinearizationLUTInfoD1Ev:
0000000000115b10	pushq	%rbp
0000000000115b11	movq	%rsp, %rbp
0000000000115b14	popq	%rbp
0000000000115b15	retq
0000000000115b16	nopw	%cs:(%rax,%rax)
__ZN30HGAppleLogLinearizationLUTInfoD0Ev:
0000000000115b20	pushq	%rbp
0000000000115b21	movq	%rsp, %rbp
0000000000115b24	popq	%rbp
0000000000115b25	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000115b2a	nopw	(%rax,%rax)
__ZNK30HGAppleLogLinearizationLUTInfo9duplicateEv:
0000000000115b30	pushq	%rbp
0000000000115b31	movq	%rsp, %rbp
0000000000115b34	pushq	%rbx
0000000000115b35	pushq	%rax
0000000000115b36	movq	%rdi, %rbx
0000000000115b39	movl	$0x28, %edi
0000000000115b3e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115b43	movups	0x8(%rbx), %xmm0
0000000000115b47	movups	0x14(%rbx), %xmm1
0000000000115b4b	movups	%xmm0, 0x8(%rax)
0000000000115b4f	movups	%xmm1, 0x14(%rax)
0000000000115b53	leaq	0x9073be(%rip), %rcx
0000000000115b5a	movq	%rcx, (%rax)
0000000000115b5d	addq	$0x8, %rsp
0000000000115b61	popq	%rbx
0000000000115b62	popq	%rbp
0000000000115b63	retq
0000000000115b64	nopw	%cs:(%rax,%rax)
__ZN29HGDJIDLogLinearizationLUTInfoD1Ev:
0000000000115b70	pushq	%rbp
0000000000115b71	movq	%rsp, %rbp
0000000000115b74	popq	%rbp
0000000000115b75	retq
0000000000115b76	nopw	%cs:(%rax,%rax)
__ZN29HGDJIDLogLinearizationLUTInfoD0Ev:
0000000000115b80	pushq	%rbp
0000000000115b81	movq	%rsp, %rbp
0000000000115b84	popq	%rbp
0000000000115b85	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000115b8a	nopw	(%rax,%rax)
__ZNK29HGDJIDLogLinearizationLUTInfo9duplicateEv:
0000000000115b90	pushq	%rbp
0000000000115b91	movq	%rsp, %rbp
0000000000115b94	pushq	%rbx
0000000000115b95	pushq	%rax
0000000000115b96	movq	%rdi, %rbx
0000000000115b99	movl	$0x28, %edi
0000000000115b9e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115ba3	movups	0x8(%rbx), %xmm0
0000000000115ba7	movups	0x14(%rbx), %xmm1
0000000000115bab	movups	%xmm0, 0x8(%rax)
0000000000115baf	movups	%xmm1, 0x14(%rax)
0000000000115bb3	leaq	0x9073ae(%rip), %rcx
0000000000115bba	movq	%rcx, (%rax)
0000000000115bbd	addq	$0x8, %rsp
0000000000115bc1	popq	%rbx
0000000000115bc2	popq	%rbp
0000000000115bc3	retq
0000000000115bc4	nopw	%cs:(%rax,%rax)
__ZN34HGFujifilmFLogLinearizationLUTInfoD1Ev:
0000000000115bd0	pushq	%rbp
0000000000115bd1	movq	%rsp, %rbp
0000000000115bd4	popq	%rbp
0000000000115bd5	retq
0000000000115bd6	nopw	%cs:(%rax,%rax)
__ZN34HGFujifilmFLogLinearizationLUTInfoD0Ev:
0000000000115be0	pushq	%rbp
0000000000115be1	movq	%rsp, %rbp
0000000000115be4	popq	%rbp
0000000000115be5	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000115bea	nopw	(%rax,%rax)
__ZNK34HGFujifilmFLogLinearizationLUTInfo9duplicateEv:
0000000000115bf0	pushq	%rbp
0000000000115bf1	movq	%rsp, %rbp
0000000000115bf4	pushq	%rbx
0000000000115bf5	pushq	%rax
0000000000115bf6	movq	%rdi, %rbx
0000000000115bf9	movl	$0x28, %edi
0000000000115bfe	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115c03	movups	0x8(%rbx), %xmm0
0000000000115c07	movups	0x14(%rbx), %xmm1
0000000000115c0b	movups	%xmm0, 0x8(%rax)
0000000000115c0f	movups	%xmm1, 0x14(%rax)
0000000000115c13	leaq	0x90739e(%rip), %rcx
0000000000115c1a	movq	%rcx, (%rax)
0000000000115c1d	addq	$0x8, %rsp
0000000000115c21	popq	%rbx
0000000000115c22	popq	%rbp
0000000000115c23	retq
0000000000115c24	nopw	%cs:(%rax,%rax)
__ZN35HGFujifilmFLog2LinearizationLUTInfoD1Ev:
0000000000115c30	pushq	%rbp
0000000000115c31	movq	%rsp, %rbp
0000000000115c34	popq	%rbp
0000000000115c35	retq
0000000000115c36	nopw	%cs:(%rax,%rax)
__ZN35HGFujifilmFLog2LinearizationLUTInfoD0Ev:
0000000000115c40	pushq	%rbp
0000000000115c41	movq	%rsp, %rbp
0000000000115c44	popq	%rbp
0000000000115c45	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000115c4a	nopw	(%rax,%rax)
__ZNK35HGFujifilmFLog2LinearizationLUTInfo9duplicateEv:
0000000000115c50	pushq	%rbp
0000000000115c51	movq	%rsp, %rbp
0000000000115c54	pushq	%rbx
0000000000115c55	pushq	%rax
0000000000115c56	movq	%rdi, %rbx
0000000000115c59	movl	$0x28, %edi
0000000000115c5e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115c63	movups	0x8(%rbx), %xmm0
0000000000115c67	movups	0x14(%rbx), %xmm1
0000000000115c6b	movups	%xmm0, 0x8(%rax)
0000000000115c6f	movups	%xmm1, 0x14(%rax)
0000000000115c73	leaq	0x90738e(%rip), %rcx
0000000000115c7a	movq	%rcx, (%rax)
0000000000115c7d	addq	$0x8, %rsp
0000000000115c81	popq	%rbx
0000000000115c82	popq	%rbp
0000000000115c83	retq
0000000000115c84	nopw	%cs:(%rax,%rax)
__ZN30HGAYCCToneCurveToLinearLUTInfoD1Ev:
0000000000115c90	pushq	%rbp
0000000000115c91	movq	%rsp, %rbp
0000000000115c94	popq	%rbp
0000000000115c95	retq
0000000000115c96	nopw	%cs:(%rax,%rax)
__ZN30HGAYCCToneCurveToLinearLUTInfoD0Ev:
0000000000115ca0	pushq	%rbp
0000000000115ca1	movq	%rsp, %rbp
0000000000115ca4	popq	%rbp
0000000000115ca5	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000115caa	nopw	(%rax,%rax)
__ZNK30HGAYCCToneCurveToLinearLUTInfo9duplicateEv:
0000000000115cb0	pushq	%rbp
0000000000115cb1	movq	%rsp, %rbp
0000000000115cb4	pushq	%rbx
0000000000115cb5	pushq	%rax
0000000000115cb6	movq	%rdi, %rbx
0000000000115cb9	movl	$0x28, %edi
0000000000115cbe	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115cc3	movups	0x8(%rbx), %xmm0
0000000000115cc7	movups	0x14(%rbx), %xmm1
0000000000115ccb	movups	%xmm0, 0x8(%rax)
0000000000115ccf	movups	%xmm1, 0x14(%rax)
0000000000115cd3	leaq	0x90737e(%rip), %rcx
0000000000115cda	movq	%rcx, (%rax)
0000000000115cdd	addq	$0x8, %rsp
0000000000115ce1	popq	%rbx
0000000000115ce2	popq	%rbp
0000000000115ce3	retq
0000000000115ce4	nopw	%cs:(%rax,%rax)
__ZN30HGLinearToAYCCToneCurveLUTInfoD1Ev:
0000000000115cf0	pushq	%rbp
0000000000115cf1	movq	%rsp, %rbp
0000000000115cf4	popq	%rbp
0000000000115cf5	retq
0000000000115cf6	nopw	%cs:(%rax,%rax)
__ZN30HGLinearToAYCCToneCurveLUTInfoD0Ev:
0000000000115d00	pushq	%rbp
0000000000115d01	movq	%rsp, %rbp
0000000000115d04	popq	%rbp
0000000000115d05	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000115d0a	nopw	(%rax,%rax)
__ZNK30HGLinearToAYCCToneCurveLUTInfo9duplicateEv:
0000000000115d10	pushq	%rbp
0000000000115d11	movq	%rsp, %rbp
0000000000115d14	pushq	%rbx
0000000000115d15	pushq	%rax
0000000000115d16	movq	%rdi, %rbx
0000000000115d19	movl	$0x28, %edi
0000000000115d1e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115d23	movups	0x8(%rbx), %xmm0
0000000000115d27	movups	0x14(%rbx), %xmm1
0000000000115d2b	movups	%xmm0, 0x8(%rax)
0000000000115d2f	movups	%xmm1, 0x14(%rax)
0000000000115d33	leaq	0x90736e(%rip), %rcx
0000000000115d3a	movq	%rcx, (%rax)
0000000000115d3d	addq	$0x8, %rsp
0000000000115d41	popq	%rbx
0000000000115d42	popq	%rbp
0000000000115d43	retq
0000000000115d44	nopw	%cs:(%rax,%rax)
__ZN33HG_ERsRGBToneCurveToLinearLUTInfoD1Ev:
0000000000115d50	pushq	%rbp
0000000000115d51	movq	%rsp, %rbp
0000000000115d54	popq	%rbp
0000000000115d55	retq
0000000000115d56	nopw	%cs:(%rax,%rax)
__ZN33HG_ERsRGBToneCurveToLinearLUTInfoD0Ev:
0000000000115d60	pushq	%rbp
0000000000115d61	movq	%rsp, %rbp
0000000000115d64	popq	%rbp
0000000000115d65	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000115d6a	nopw	(%rax,%rax)
__ZNK33HG_ERsRGBToneCurveToLinearLUTInfo9duplicateEv:
0000000000115d70	pushq	%rbp
0000000000115d71	movq	%rsp, %rbp
0000000000115d74	pushq	%rbx
0000000000115d75	pushq	%rax
0000000000115d76	movq	%rdi, %rbx
0000000000115d79	movl	$0x28, %edi
0000000000115d7e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115d83	movups	0x8(%rbx), %xmm0
0000000000115d87	movups	0x14(%rbx), %xmm1
0000000000115d8b	movups	%xmm0, 0x8(%rax)
0000000000115d8f	movups	%xmm1, 0x14(%rax)
0000000000115d93	leaq	0x90735e(%rip), %rcx
0000000000115d9a	movq	%rcx, (%rax)
0000000000115d9d	addq	$0x8, %rsp
0000000000115da1	popq	%rbx
0000000000115da2	popq	%rbp
0000000000115da3	retq
0000000000115da4	nopw	%cs:(%rax,%rax)
__ZN32HGLinearToERsRGBToneCurveLUTInfoD1Ev:
0000000000115db0	pushq	%rbp
0000000000115db1	movq	%rsp, %rbp
0000000000115db4	popq	%rbp
0000000000115db5	retq
0000000000115db6	nopw	%cs:(%rax,%rax)
__ZN32HGLinearToERsRGBToneCurveLUTInfoD0Ev:
0000000000115dc0	pushq	%rbp
0000000000115dc1	movq	%rsp, %rbp
0000000000115dc4	popq	%rbp
0000000000115dc5	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000115dca	nopw	(%rax,%rax)
__ZNK32HGLinearToERsRGBToneCurveLUTInfo9duplicateEv:
0000000000115dd0	pushq	%rbp
0000000000115dd1	movq	%rsp, %rbp
0000000000115dd4	pushq	%rbx
0000000000115dd5	pushq	%rax
0000000000115dd6	movq	%rdi, %rbx
0000000000115dd9	movl	$0x28, %edi
0000000000115dde	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115de3	movups	0x8(%rbx), %xmm0
0000000000115de7	movups	0x14(%rbx), %xmm1
0000000000115deb	movups	%xmm0, 0x8(%rax)
0000000000115def	movups	%xmm1, 0x14(%rax)
0000000000115df3	leaq	0x90734e(%rip), %rcx
0000000000115dfa	movq	%rcx, (%rax)
0000000000115dfd	addq	$0x8, %rsp
0000000000115e01	popq	%rbx
0000000000115e02	popq	%rbp
0000000000115e03	retq
0000000000115e04	nopw	%cs:(%rax,%rax)
__ZN5GLPBOC2E14HGGLContextPtr:
0000000000115e10	pushq	%rbp
0000000000115e11	movq	%rsp, %rbp
0000000000115e14	pushq	%r14
0000000000115e16	pushq	%rbx
0000000000115e17	subq	$0x20, %rsp
0000000000115e1b	movq	%rdi, %rbx
