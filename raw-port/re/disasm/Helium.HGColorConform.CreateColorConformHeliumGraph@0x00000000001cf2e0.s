__ZN14HGColorConform29CreateColorConformHeliumGraphEP10HGRenderer:
00000000001cf2e0	pushq	%rbp
00000000001cf2e1	movq	%rsp, %rbp
00000000001cf2e4	pushq	%r15
00000000001cf2e6	pushq	%r14
00000000001cf2e8	pushq	%r13
00000000001cf2ea	pushq	%r12
00000000001cf2ec	pushq	%rbx
00000000001cf2ed	subq	$0xe8, %rsp
00000000001cf2f4	movq	%rsi, -0xf8(%rbp)
00000000001cf2fb	movq	0x832f56(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001cf302	movq	(%rax), %rax
00000000001cf305	movq	%rax, -0x30(%rbp)
00000000001cf309	movq	0x1a8(%rdi), %rax
00000000001cf310	testq	%rax, %rax
00000000001cf313	je	0x1d0445
00000000001cf319	movq	0x10(%rax), %r13
00000000001cf31d	movq	0x8(%r13), %rax
00000000001cf321	subq	(%r13), %rax
00000000001cf325	shrq	$0x3, %rax
00000000001cf329	movq	%rax, -0xe0(%rbp)
00000000001cf330	testl	%eax, %eax
00000000001cf332	je	0x1d0445
00000000001cf338	movq	%rdi, %rbx
00000000001cf33b	movq	0x1a0(%rdi), %rdi
00000000001cf342	testq	%rdi, %rdi
00000000001cf345	je	0x1cf34d
00000000001cf347	movq	(%rdi), %rax
00000000001cf34a	callq	*0x18(%rax)
00000000001cf34d	movq	%rbx, -0x78(%rbp)
00000000001cf351	cmpl	$0x0, -0xe0(%rbp)
00000000001cf358	jle	0x1d046d
00000000001cf35e	xorl	%esi, %esi
00000000001cf360	movq	$0x0, -0x88(%rbp)
00000000001cf36b	movq	-0xe0(%rbp), %rax
00000000001cf372	jmp	0x1cf39b
00000000001cf374	movq	-0x78(%rbp), %rax
00000000001cf378	movq	%r12, 0x198(%rax)
00000000001cf37f	movq	-0x80(%rbp), %rsi
00000000001cf383	incl	%esi
00000000001cf385	movq	%r12, -0x88(%rbp)
00000000001cf38c	movq	-0xe0(%rbp), %rax
00000000001cf393	cmpl	%eax, %esi
00000000001cf395	jge	0x1d0470
00000000001cf39b	movl	%eax, %edx
00000000001cf39d	subl	%esi, %edx
00000000001cf39f	movq	(%r13), %rax
00000000001cf3a3	movq	0x8(%r13), %rcx
00000000001cf3a7	cmpl	$0x3, %edx
00000000001cf3aa	movq	%rsi, -0x80(%rbp)
00000000001cf3ae	jl	0x1cf6a0
00000000001cf3b4	movslq	%esi, %r14
00000000001cf3b7	subq	%rax, %rcx
00000000001cf3ba	sarq	$0x3, %rcx
00000000001cf3be	cmpq	%r14, %rcx
00000000001cf3c1	jbe	0x1d0669
00000000001cf3c7	movq	(%rax,%r14,8), %rdx
00000000001cf3cb	cmpl	$0x1, (%rdx)
00000000001cf3ce	jne	0x1cf6b4
00000000001cf3d4	movq	-0x80(%rbp), %rdx
00000000001cf3d8	incl	%edx
00000000001cf3da	movslq	%edx, %rbx
00000000001cf3dd	cmpq	%rbx, %rcx
00000000001cf3e0	jbe	0x1d0673
00000000001cf3e6	movq	(%rax,%rbx,8), %rdx
00000000001cf3ea	movl	(%rdx), %edx
00000000001cf3ec	addl	$-0x2, %edx
00000000001cf3ef	cmpl	$0x4, %edx
00000000001cf3f2	ja	0x1cf6b4
00000000001cf3f8	movq	-0x80(%rbp), %rdx
00000000001cf3fc	addl	$0x2, %edx
00000000001cf3ff	movslq	%edx, %r15
00000000001cf402	cmpq	%r15, %rcx
00000000001cf405	jbe	0x1d06c3
00000000001cf40b	movq	(%rax,%r15,8), %rdx
00000000001cf40f	cmpl	$0x1, (%rdx)
00000000001cf412	jne	0x1cf6b4
00000000001cf418	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cf41d	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cf422	movq	%rax, %r12
00000000001cf425	movq	%rax, %rdi
00000000001cf428	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cf42d	movq	-0x78(%rbp), %rax
00000000001cf431	movzbl	0x1da(%rax), %esi
00000000001cf438	movq	%r12, %rdi
00000000001cf43b	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cf440	movq	%r12, %rdi
00000000001cf443	xorl	%esi, %esi
00000000001cf445	xorl	%edx, %edx
00000000001cf447	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001cf44c	movq	-0x78(%rbp), %rax
00000000001cf450	movss	0x1dc(%rax), %xmm0
00000000001cf458	movss	0x1e0(%rax), %xmm1
00000000001cf460	movq	%r12, %rdi
00000000001cf463	callq	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff ## HGColorGamma::Set1DLutScaleAndOffset(float, float)
00000000001cf468	movq	(%r13), %rax
00000000001cf46c	movq	0x8(%r13), %rcx
00000000001cf470	subq	%rax, %rcx
00000000001cf473	sarq	$0x3, %rcx
00000000001cf477	cmpq	%r14, %rcx
00000000001cf47a	jbe	0x1d0750
00000000001cf480	movq	(%rax,%r14,8), %rax
00000000001cf484	movaps	0x10(%rax), %xmm0
00000000001cf488	movaps	%xmm0, -0x70(%rbp)
00000000001cf48c	movq	(%r13), %rax
00000000001cf490	movq	0x8(%r13), %rcx
00000000001cf494	subq	%rax, %rcx
00000000001cf497	sarq	$0x3, %rcx
00000000001cf49b	cmpq	%r14, %rcx
00000000001cf49e	jbe	0x1d0757
00000000001cf4a4	movq	(%rax,%r14,8), %rax
00000000001cf4a8	movaps	0x20(%rax), %xmm0
00000000001cf4ac	movaps	%xmm0, -0x60(%rbp)
00000000001cf4b0	movq	(%r13), %rax
00000000001cf4b4	movq	0x8(%r13), %rcx
00000000001cf4b8	subq	%rax, %rcx
00000000001cf4bb	sarq	$0x3, %rcx
00000000001cf4bf	cmpq	%r14, %rcx
00000000001cf4c2	jbe	0x1d075e
00000000001cf4c8	movq	(%rax,%r14,8), %rax
00000000001cf4cc	movaps	0x30(%rax), %xmm0
00000000001cf4d0	movaps	%xmm0, -0x50(%rbp)
00000000001cf4d4	movq	(%r13), %rax
00000000001cf4d8	movq	0x8(%r13), %rcx
00000000001cf4dc	subq	%rax, %rcx
00000000001cf4df	sarq	$0x3, %rcx
00000000001cf4e3	cmpq	%r14, %rcx
00000000001cf4e6	jbe	0x1d0765
00000000001cf4ec	movq	(%rax,%r14,8), %rax
00000000001cf4f0	movaps	0x40(%rax), %xmm0
00000000001cf4f4	movaps	%xmm0, -0x40(%rbp)
00000000001cf4f8	movq	%r12, %rdi
00000000001cf4fb	leaq	-0x70(%rbp), %rsi
00000000001cf4ff	callq	__ZN12HGColorGamma11LoadMatrix1EPKDv4_f ## HGColorGamma::LoadMatrix1(float vector[4] const*)
00000000001cf504	movq	-0x78(%rbp), %rax
00000000001cf508	movl	0x1b4(%rax), %esi
00000000001cf50e	movq	%r12, %rdi
00000000001cf511	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
00000000001cf516	movq	-0x78(%rbp), %rax
00000000001cf51a	movzbl	0x1b0(%rax), %esi
00000000001cf521	movq	%r12, %rdi
00000000001cf524	callq	__ZN12HGColorGamma15SetFallbackModeEb ## HGColorGamma::SetFallbackMode(bool)
00000000001cf529	movq	-0x78(%rbp), %rax
00000000001cf52d	movl	0x1c4(%rax), %esi
00000000001cf533	movq	%r12, %rdi
00000000001cf536	callq	__ZN12HGColorGamma21SetInOut422FilterModeENS_30hgColorGammaInOut422FilterModeE ## HGColorGamma::SetInOut422FilterMode(HGColorGamma::hgColorGammaInOut422FilterMode)
00000000001cf53b	movq	-0x78(%rbp), %rax
00000000001cf53f	movq	0x1c8(%rax), %rsi
00000000001cf546	movq	0x1d0(%rax), %rdx
00000000001cf54d	movq	%r12, %rdi
00000000001cf550	callq	__ZN12HGColorGamma21SetInOut422FilterRectE6HGRect ## HGColorGamma::SetInOut422FilterRect(HGRect)
00000000001cf555	movq	-0x78(%rbp), %rax
00000000001cf559	movzbl	0x1b2(%rax), %esi
00000000001cf560	movq	%r12, %rdi
00000000001cf563	callq	__ZN12HGColorGamma26SetFixedPointPrecisionModeEb ## HGColorGamma::SetFixedPointPrecisionMode(bool)
00000000001cf568	movq	(%r13), %rax
00000000001cf56c	movq	0x8(%r13), %rcx
00000000001cf570	subq	%rax, %rcx
00000000001cf573	sarq	$0x3, %rcx
00000000001cf577	cmpq	%rbx, %rcx
00000000001cf57a	jbe	0x1d076c
00000000001cf580	movq	(%rax,%rbx,8), %rax
00000000001cf584	movl	(%rax), %esi
00000000001cf586	leal	-0x3(%rsi), %ecx
00000000001cf589	addl	$-0x2, %esi
00000000001cf58c	cmpl	$0x4, %ecx
00000000001cf58f	movl	$0x0, %ecx
00000000001cf594	cmovael	%ecx, %esi
00000000001cf597	movaps	0x50(%rax), %xmm0
00000000001cf59b	movaps	0x60(%rax), %xmm1
00000000001cf59f	movaps	0x70(%rax), %xmm2
00000000001cf5a3	movaps	0x80(%rax), %xmm3
00000000001cf5aa	movaps	0x90(%rax), %xmm4
00000000001cf5b1	movaps	0xa0(%rax), %xmm5
00000000001cf5b8	movaps	0xb0(%rax), %xmm6
00000000001cf5bf	movq	%r12, %rdi
00000000001cf5c2	callq	__ZN12HGColorGamma16SetGammaFunctionENS_16hgColorGammaFormEDv4_fS1_S1_S1_S1_S1_S1_ ## HGColorGamma::SetGammaFunction(HGColorGamma::hgColorGammaForm, float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4])
00000000001cf5c7	movq	(%r13), %rax
00000000001cf5cb	movq	0x8(%r13), %rcx
00000000001cf5cf	subq	%rax, %rcx
00000000001cf5d2	sarq	$0x3, %rcx
00000000001cf5d6	cmpq	%r15, %rcx
00000000001cf5d9	jbe	0x1d0773
00000000001cf5df	movq	(%rax,%r15,8), %rax
00000000001cf5e3	movaps	0x10(%rax), %xmm0
00000000001cf5e7	movaps	%xmm0, -0x70(%rbp)
00000000001cf5eb	movq	(%r13), %rax
00000000001cf5ef	movq	0x8(%r13), %rcx
00000000001cf5f3	subq	%rax, %rcx
00000000001cf5f6	sarq	$0x3, %rcx
00000000001cf5fa	cmpq	%r15, %rcx
00000000001cf5fd	jbe	0x1d077a
00000000001cf603	movq	(%rax,%r15,8), %rax
00000000001cf607	movaps	0x20(%rax), %xmm0
00000000001cf60b	movaps	%xmm0, -0x60(%rbp)
00000000001cf60f	movq	(%r13), %rax
00000000001cf613	movq	0x8(%r13), %rcx
00000000001cf617	subq	%rax, %rcx
00000000001cf61a	sarq	$0x3, %rcx
00000000001cf61e	cmpq	%r15, %rcx
00000000001cf621	jbe	0x1d0781
00000000001cf627	movq	(%rax,%r15,8), %rax
00000000001cf62b	movaps	0x30(%rax), %xmm0
00000000001cf62f	movaps	%xmm0, -0x50(%rbp)
00000000001cf633	movq	(%r13), %rax
00000000001cf637	movq	0x8(%r13), %rcx
00000000001cf63b	subq	%rax, %rcx
00000000001cf63e	sarq	$0x3, %rcx
00000000001cf642	cmpq	%r15, %rcx
00000000001cf645	jbe	0x1d0788
00000000001cf64b	cmpl	$0x0, -0x80(%rbp)
00000000001cf64f	sete	%bl
00000000001cf652	movq	(%rax,%r15,8), %rax
00000000001cf656	movaps	0x40(%rax), %xmm0
00000000001cf65a	movaps	%xmm0, -0x40(%rbp)
00000000001cf65e	movq	%r12, %rdi
00000000001cf661	leaq	-0x70(%rbp), %rsi
00000000001cf665	callq	__ZN12HGColorGamma11LoadMatrix2EPKDv4_f ## HGColorGamma::LoadMatrix2(float vector[4] const*)
00000000001cf66a	testb	%bl, %bl
00000000001cf66c	jne	0x1d0329
00000000001cf672	movq	(%r12), %rax
00000000001cf676	movq	%r12, %rdi
00000000001cf679	xorl	%esi, %esi
00000000001cf67b	movq	-0x88(%rbp), %rdx
00000000001cf682	callq	*0x78(%rax)
00000000001cf685	movq	-0x88(%rbp), %rdi
00000000001cf68c	movq	(%rdi), %rax
00000000001cf68f	callq	*0x18(%rax)
00000000001cf692	jmp	0x1d0334
00000000001cf697	nopw	(%rax,%rax)
00000000001cf6a0	cmpl	$0x2, %edx
00000000001cf6a3	jne	0x1cfb00
00000000001cf6a9	movslq	-0x80(%rbp), %r14
00000000001cf6ad	subq	%rax, %rcx
00000000001cf6b0	sarq	$0x3, %rcx
00000000001cf6b4	cmpq	%r14, %rcx
00000000001cf6b7	jbe	0x1d065f
00000000001cf6bd	movq	(%rax,%r14,8), %rdx
00000000001cf6c1	movl	(%rdx), %edx
00000000001cf6c3	cmpl	$0x2, %edx
00000000001cf6c6	jl	0x1cf8e0
00000000001cf6cc	cmpl	$0x6, %edx
00000000001cf6cf	ja	0x1cfb07
00000000001cf6d5	movq	-0x80(%rbp), %rdx
00000000001cf6d9	incl	%edx
00000000001cf6db	movslq	%edx, %r15
00000000001cf6de	cmpq	%r15, %rcx
00000000001cf6e1	jbe	0x1d06b9
00000000001cf6e7	movq	(%rax,%r15,8), %rdx
00000000001cf6eb	cmpl	$0x1, (%rdx)
00000000001cf6ee	jne	0x1cfb07
00000000001cf6f4	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cf6f9	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cf6fe	movq	%rax, %r12
00000000001cf701	movq	%rax, %rdi
00000000001cf704	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cf709	movq	-0x78(%rbp), %rax
00000000001cf70d	movzbl	0x1da(%rax), %esi
00000000001cf714	movq	%r12, %rdi
00000000001cf717	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cf71c	movq	%r12, %rdi
00000000001cf71f	xorl	%esi, %esi
00000000001cf721	xorl	%edx, %edx
00000000001cf723	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001cf728	movq	-0x78(%rbp), %rax
00000000001cf72c	movss	0x1dc(%rax), %xmm0
00000000001cf734	movss	0x1e0(%rax), %xmm1
00000000001cf73c	movq	%r12, %rdi
00000000001cf73f	callq	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff ## HGColorGamma::Set1DLutScaleAndOffset(float, float)
00000000001cf744	movq	-0x78(%rbp), %rax
00000000001cf748	movl	0x1b4(%rax), %esi
00000000001cf74e	movq	%r12, %rdi
00000000001cf751	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
00000000001cf756	movq	-0x78(%rbp), %rax
00000000001cf75a	movzbl	0x1b0(%rax), %esi
00000000001cf761	movq	%r12, %rdi
00000000001cf764	callq	__ZN12HGColorGamma15SetFallbackModeEb ## HGColorGamma::SetFallbackMode(bool)
00000000001cf769	movq	-0x78(%rbp), %rax
00000000001cf76d	movl	0x1c4(%rax), %esi
00000000001cf773	movq	%r12, %rdi
00000000001cf776	callq	__ZN12HGColorGamma21SetInOut422FilterModeENS_30hgColorGammaInOut422FilterModeE ## HGColorGamma::SetInOut422FilterMode(HGColorGamma::hgColorGammaInOut422FilterMode)
00000000001cf77b	movq	-0x78(%rbp), %rax
00000000001cf77f	movq	0x1c8(%rax), %rsi
00000000001cf786	movq	0x1d0(%rax), %rdx
00000000001cf78d	movq	%r12, %rdi
00000000001cf790	callq	__ZN12HGColorGamma21SetInOut422FilterRectE6HGRect ## HGColorGamma::SetInOut422FilterRect(HGRect)
00000000001cf795	movq	-0x78(%rbp), %rax
00000000001cf799	movzbl	0x1b2(%rax), %esi
00000000001cf7a0	movq	%r12, %rdi
00000000001cf7a3	callq	__ZN12HGColorGamma26SetFixedPointPrecisionModeEb ## HGColorGamma::SetFixedPointPrecisionMode(bool)
00000000001cf7a8	movq	(%r13), %rax
00000000001cf7ac	movq	0x8(%r13), %rcx
00000000001cf7b0	subq	%rax, %rcx
00000000001cf7b3	sarq	$0x3, %rcx
00000000001cf7b7	cmpq	%r14, %rcx
00000000001cf7ba	jbe	0x1d0727
00000000001cf7c0	movq	(%rax,%r14,8), %rax
00000000001cf7c4	movl	(%rax), %esi
00000000001cf7c6	leal	-0x3(%rsi), %ecx
00000000001cf7c9	addl	$-0x2, %esi
00000000001cf7cc	cmpl	$0x4, %ecx
00000000001cf7cf	movl	$0x0, %ecx
00000000001cf7d4	cmovael	%ecx, %esi
00000000001cf7d7	movaps	0x50(%rax), %xmm0
00000000001cf7db	movaps	0x60(%rax), %xmm1
00000000001cf7df	movaps	0x70(%rax), %xmm2
00000000001cf7e3	movaps	0x80(%rax), %xmm3
00000000001cf7ea	movaps	0x90(%rax), %xmm4
00000000001cf7f1	movaps	0xa0(%rax), %xmm5
00000000001cf7f8	movaps	0xb0(%rax), %xmm6
00000000001cf7ff	movq	%r12, %rdi
00000000001cf802	callq	__ZN12HGColorGamma16SetGammaFunctionENS_16hgColorGammaFormEDv4_fS1_S1_S1_S1_S1_S1_ ## HGColorGamma::SetGammaFunction(HGColorGamma::hgColorGammaForm, float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4])
00000000001cf807	movq	(%r13), %rax
00000000001cf80b	movq	0x8(%r13), %rcx
00000000001cf80f	subq	%rax, %rcx
00000000001cf812	sarq	$0x3, %rcx
00000000001cf816	cmpq	%r15, %rcx
00000000001cf819	jbe	0x1d06f5
00000000001cf81f	movq	(%rax,%r15,8), %rax
00000000001cf823	movaps	0x10(%rax), %xmm0
00000000001cf827	movaps	%xmm0, -0x70(%rbp)
00000000001cf82b	movq	(%r13), %rax
00000000001cf82f	movq	0x8(%r13), %rcx
00000000001cf833	subq	%rax, %rcx
00000000001cf836	sarq	$0x3, %rcx
00000000001cf83a	cmpq	%r15, %rcx
00000000001cf83d	jbe	0x1d06e1
00000000001cf843	movq	(%rax,%r15,8), %rax
00000000001cf847	movaps	0x20(%rax), %xmm0
00000000001cf84b	movaps	%xmm0, -0x60(%rbp)
00000000001cf84f	movq	(%r13), %rax
00000000001cf853	movq	0x8(%r13), %rcx
00000000001cf857	subq	%rax, %rcx
00000000001cf85a	sarq	$0x3, %rcx
00000000001cf85e	cmpq	%r15, %rcx
00000000001cf861	jbe	0x1d06eb
00000000001cf867	movq	(%rax,%r15,8), %rax
00000000001cf86b	movaps	0x30(%rax), %xmm0
00000000001cf86f	movaps	%xmm0, -0x50(%rbp)
00000000001cf873	movq	(%r13), %rax
00000000001cf877	movq	0x8(%r13), %rcx
00000000001cf87b	subq	%rax, %rcx
00000000001cf87e	sarq	$0x3, %rcx
00000000001cf882	cmpq	%r15, %rcx
00000000001cf885	jbe	0x1d06cd
00000000001cf88b	cmpl	$0x0, -0x80(%rbp)
00000000001cf88f	sete	%bl
00000000001cf892	movq	(%rax,%r15,8), %rax
00000000001cf896	movaps	0x40(%rax), %xmm0
00000000001cf89a	movaps	%xmm0, -0x40(%rbp)
00000000001cf89e	movq	%r12, %rdi
00000000001cf8a1	leaq	-0x70(%rbp), %rsi
00000000001cf8a5	callq	__ZN12HGColorGamma11LoadMatrix2EPKDv4_f ## HGColorGamma::LoadMatrix2(float vector[4] const*)
00000000001cf8aa	testb	%bl, %bl
00000000001cf8ac	jne	0x1d0090
00000000001cf8b2	movq	(%r12), %rax
00000000001cf8b6	movq	%r12, %rdi
00000000001cf8b9	xorl	%esi, %esi
00000000001cf8bb	movq	-0x88(%rbp), %rdx
00000000001cf8c2	callq	*0x78(%rax)
00000000001cf8c5	movq	-0x88(%rbp), %rdi
00000000001cf8cc	movq	(%rdi), %rax
00000000001cf8cf	callq	*0x18(%rax)
00000000001cf8d2	jmp	0x1d009b
00000000001cf8d7	nopw	(%rax,%rax)
00000000001cf8e0	cmpl	$0x1, %edx
00000000001cf8e3	jne	0x1cfb07
00000000001cf8e9	movq	-0x80(%rbp), %rdx
00000000001cf8ed	incl	%edx
00000000001cf8ef	movslq	%edx, %rbx
00000000001cf8f2	cmpq	%rbx, %rcx
00000000001cf8f5	jbe	0x1d06af
00000000001cf8fb	movq	(%rax,%rbx,8), %rdx
00000000001cf8ff	movl	(%rdx), %edx
00000000001cf901	addl	$-0x2, %edx
00000000001cf904	cmpl	$0x4, %edx
00000000001cf907	ja	0x1cfb07
00000000001cf90d	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cf912	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cf917	movq	%rax, %r12
00000000001cf91a	movq	%rax, %rdi
00000000001cf91d	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cf922	movq	-0x78(%rbp), %rax
00000000001cf926	movzbl	0x1da(%rax), %esi
00000000001cf92d	movq	%r12, %rdi
00000000001cf930	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cf935	movq	%r12, %rdi
00000000001cf938	xorl	%esi, %esi
00000000001cf93a	xorl	%edx, %edx
00000000001cf93c	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001cf941	movq	-0x78(%rbp), %rax
00000000001cf945	movss	0x1dc(%rax), %xmm0
00000000001cf94d	movss	0x1e0(%rax), %xmm1
00000000001cf955	movq	%r12, %rdi
00000000001cf958	callq	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff ## HGColorGamma::Set1DLutScaleAndOffset(float, float)
00000000001cf95d	movq	-0x78(%rbp), %rax
00000000001cf961	movl	0x1b4(%rax), %esi
00000000001cf967	movq	%r12, %rdi
00000000001cf96a	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
00000000001cf96f	movq	-0x78(%rbp), %rax
00000000001cf973	movzbl	0x1b0(%rax), %esi
00000000001cf97a	movq	%r12, %rdi
00000000001cf97d	callq	__ZN12HGColorGamma15SetFallbackModeEb ## HGColorGamma::SetFallbackMode(bool)
00000000001cf982	movq	-0x78(%rbp), %rax
00000000001cf986	movl	0x1c4(%rax), %esi
00000000001cf98c	movq	%r12, %rdi
00000000001cf98f	callq	__ZN12HGColorGamma21SetInOut422FilterModeENS_30hgColorGammaInOut422FilterModeE ## HGColorGamma::SetInOut422FilterMode(HGColorGamma::hgColorGammaInOut422FilterMode)
00000000001cf994	movq	-0x78(%rbp), %rax
00000000001cf998	movq	0x1c8(%rax), %rsi
00000000001cf99f	movq	0x1d0(%rax), %rdx
00000000001cf9a6	movq	%r12, %rdi
00000000001cf9a9	callq	__ZN12HGColorGamma21SetInOut422FilterRectE6HGRect ## HGColorGamma::SetInOut422FilterRect(HGRect)
00000000001cf9ae	movq	-0x78(%rbp), %rax
00000000001cf9b2	movzbl	0x1b2(%rax), %esi
00000000001cf9b9	movq	%r12, %rdi
00000000001cf9bc	callq	__ZN12HGColorGamma26SetFixedPointPrecisionModeEb ## HGColorGamma::SetFixedPointPrecisionMode(bool)
00000000001cf9c1	movq	(%r13), %rax
00000000001cf9c5	movq	0x8(%r13), %rcx
00000000001cf9c9	subq	%rax, %rcx
00000000001cf9cc	sarq	$0x3, %rcx
00000000001cf9d0	cmpq	%r14, %rcx
00000000001cf9d3	jbe	0x1d06d7
00000000001cf9d9	movq	(%rax,%r14,8), %rax
00000000001cf9dd	movaps	0x10(%rax), %xmm0
00000000001cf9e1	movaps	%xmm0, -0x70(%rbp)
00000000001cf9e5	movq	(%r13), %rax
00000000001cf9e9	movq	0x8(%r13), %rcx
00000000001cf9ed	subq	%rax, %rcx
00000000001cf9f0	sarq	$0x3, %rcx
00000000001cf9f4	cmpq	%r14, %rcx
00000000001cf9f7	jbe	0x1d0709
00000000001cf9fd	movq	(%rax,%r14,8), %rax
00000000001cfa01	movaps	0x20(%rax), %xmm0
00000000001cfa05	movaps	%xmm0, -0x60(%rbp)
00000000001cfa09	movq	(%r13), %rax
00000000001cfa0d	movq	0x8(%r13), %rcx
00000000001cfa11	subq	%rax, %rcx
00000000001cfa14	sarq	$0x3, %rcx
00000000001cfa18	cmpq	%r14, %rcx
00000000001cfa1b	jbe	0x1d0713
00000000001cfa21	movq	(%rax,%r14,8), %rax
00000000001cfa25	movaps	0x30(%rax), %xmm0
00000000001cfa29	movaps	%xmm0, -0x50(%rbp)
00000000001cfa2d	movq	(%r13), %rax
00000000001cfa31	movq	0x8(%r13), %rcx
00000000001cfa35	subq	%rax, %rcx
00000000001cfa38	sarq	$0x3, %rcx
00000000001cfa3c	cmpq	%r14, %rcx
00000000001cfa3f	jbe	0x1d071d
00000000001cfa45	movq	(%rax,%r14,8), %rax
00000000001cfa49	movaps	0x40(%rax), %xmm0
00000000001cfa4d	movaps	%xmm0, -0x40(%rbp)
00000000001cfa51	movq	%r12, %rdi
00000000001cfa54	leaq	-0x70(%rbp), %rsi
00000000001cfa58	callq	__ZN12HGColorGamma11LoadMatrix1EPKDv4_f ## HGColorGamma::LoadMatrix1(float vector[4] const*)
00000000001cfa5d	movq	(%r13), %rax
00000000001cfa61	movq	0x8(%r13), %rcx
00000000001cfa65	subq	%rax, %rcx
00000000001cfa68	sarq	$0x3, %rcx
00000000001cfa6c	cmpq	%rbx, %rcx
00000000001cfa6f	jbe	0x1d06ff
00000000001cfa75	cmpl	$0x0, -0x80(%rbp)
00000000001cfa79	sete	%r14b
00000000001cfa7d	movq	(%rax,%rbx,8), %rax
00000000001cfa81	movl	(%rax), %esi
00000000001cfa83	leal	-0x3(%rsi), %ecx
00000000001cfa86	addl	$-0x2, %esi
00000000001cfa89	cmpl	$0x4, %ecx
00000000001cfa8c	movl	$0x0, %ecx
00000000001cfa91	cmovael	%ecx, %esi
00000000001cfa94	movaps	0x50(%rax), %xmm0
00000000001cfa98	movaps	0x60(%rax), %xmm1
00000000001cfa9c	movaps	0x70(%rax), %xmm2
00000000001cfaa0	movaps	0x80(%rax), %xmm3
00000000001cfaa7	movaps	0x90(%rax), %xmm4
00000000001cfaae	movaps	0xa0(%rax), %xmm5
00000000001cfab5	movaps	0xb0(%rax), %xmm6
00000000001cfabc	movq	%r12, %rdi
00000000001cfabf	callq	__ZN12HGColorGamma16SetGammaFunctionENS_16hgColorGammaFormEDv4_fS1_S1_S1_S1_S1_S1_ ## HGColorGamma::SetGammaFunction(HGColorGamma::hgColorGammaForm, float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4])
00000000001cfac4	testb	%r14b, %r14b
00000000001cfac7	jne	0x1d0090
00000000001cfacd	movq	(%r12), %rax
00000000001cfad1	movq	%r12, %rdi
00000000001cfad4	xorl	%esi, %esi
00000000001cfad6	movq	-0x88(%rbp), %rdx
00000000001cfadd	callq	*0x78(%rax)
00000000001cfae0	movq	-0x88(%rbp), %rdi
00000000001cfae7	movq	(%rdi), %rax
00000000001cfaea	callq	*0x18(%rax)
00000000001cfaed	jmp	0x1d009b
00000000001cfaf2	nopw	%cs:(%rax,%rax)
00000000001cfb00	subq	%rax, %rcx
00000000001cfb03	sarq	$0x3, %rcx
00000000001cfb07	movslq	-0x80(%rbp), %r14
00000000001cfb0b	cmpq	%r14, %rcx
00000000001cfb0e	jbe	0x1d0655
00000000001cfb14	movq	(%rax,%r14,8), %rax
00000000001cfb18	movl	(%rax), %eax
00000000001cfb1a	cmpl	$0x2, %eax
00000000001cfb1d	jl	0x1cfc80
00000000001cfb23	cmpl	$0x6, %eax
00000000001cfb26	ja	0x1cfe0d
00000000001cfb2c	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cfb31	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cfb36	movq	%rax, %r12
00000000001cfb39	movq	%rax, %rdi
00000000001cfb3c	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cfb41	movq	-0x78(%rbp), %rax
00000000001cfb45	movzbl	0x1da(%rax), %esi
00000000001cfb4c	movq	%r12, %rdi
00000000001cfb4f	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cfb54	movq	%r12, %rdi
00000000001cfb57	xorl	%esi, %esi
00000000001cfb59	xorl	%edx, %edx
00000000001cfb5b	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001cfb60	movq	-0x78(%rbp), %rax
00000000001cfb64	movss	0x1dc(%rax), %xmm0
00000000001cfb6c	movss	0x1e0(%rax), %xmm1
00000000001cfb74	movq	%r12, %rdi
00000000001cfb77	callq	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff ## HGColorGamma::Set1DLutScaleAndOffset(float, float)
00000000001cfb7c	movq	-0x78(%rbp), %rax
00000000001cfb80	movl	0x1b4(%rax), %esi
00000000001cfb86	movq	%r12, %rdi
00000000001cfb89	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
00000000001cfb8e	movq	-0x78(%rbp), %rax
00000000001cfb92	movzbl	0x1b0(%rax), %esi
00000000001cfb99	movq	%r12, %rdi
00000000001cfb9c	callq	__ZN12HGColorGamma15SetFallbackModeEb ## HGColorGamma::SetFallbackMode(bool)
00000000001cfba1	movq	-0x78(%rbp), %rax
00000000001cfba5	movl	0x1c4(%rax), %esi
00000000001cfbab	movq	%r12, %rdi
00000000001cfbae	callq	__ZN12HGColorGamma21SetInOut422FilterModeENS_30hgColorGammaInOut422FilterModeE ## HGColorGamma::SetInOut422FilterMode(HGColorGamma::hgColorGammaInOut422FilterMode)
00000000001cfbb3	movq	-0x78(%rbp), %rax
00000000001cfbb7	movq	0x1c8(%rax), %rsi
00000000001cfbbe	movq	0x1d0(%rax), %rdx
00000000001cfbc5	movq	%r12, %rdi
00000000001cfbc8	callq	__ZN12HGColorGamma21SetInOut422FilterRectE6HGRect ## HGColorGamma::SetInOut422FilterRect(HGRect)
00000000001cfbcd	movq	-0x78(%rbp), %rax
00000000001cfbd1	movzbl	0x1b2(%rax), %esi
00000000001cfbd8	movq	%r12, %rdi
00000000001cfbdb	callq	__ZN12HGColorGamma26SetFixedPointPrecisionModeEb ## HGColorGamma::SetFixedPointPrecisionMode(bool)
00000000001cfbe0	movq	(%r13), %rax
00000000001cfbe4	movq	0x8(%r13), %rcx
00000000001cfbe8	subq	%rax, %rcx
00000000001cfbeb	sarq	$0x3, %rcx
00000000001cfbef	cmpq	%r14, %rcx
00000000001cfbf2	jbe	0x1d067d
00000000001cfbf8	cmpl	$0x0, -0x80(%rbp)
00000000001cfbfc	sete	%bl
00000000001cfbff	movq	(%rax,%r14,8), %rax
00000000001cfc03	movl	(%rax), %esi
00000000001cfc05	leal	-0x3(%rsi), %ecx
00000000001cfc08	addl	$-0x2, %esi
00000000001cfc0b	cmpl	$0x4, %ecx
00000000001cfc0e	movl	$0x0, %ecx
00000000001cfc13	cmovael	%ecx, %esi
00000000001cfc16	movaps	0x50(%rax), %xmm0
00000000001cfc1a	movaps	0x60(%rax), %xmm1
00000000001cfc1e	movaps	0x70(%rax), %xmm2
00000000001cfc22	movaps	0x80(%rax), %xmm3
00000000001cfc29	movaps	0x90(%rax), %xmm4
00000000001cfc30	movaps	0xa0(%rax), %xmm5
00000000001cfc37	movaps	0xb0(%rax), %xmm6
00000000001cfc3e	movq	%r12, %rdi
00000000001cfc41	callq	__ZN12HGColorGamma16SetGammaFunctionENS_16hgColorGammaFormEDv4_fS1_S1_S1_S1_S1_S1_ ## HGColorGamma::SetGammaFunction(HGColorGamma::hgColorGammaForm, float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4], float vector[4])
00000000001cfc46	testb	%bl, %bl
00000000001cfc48	jne	0x1cf374
00000000001cfc4e	movq	(%r12), %rax
00000000001cfc52	movq	%r12, %rdi
00000000001cfc55	xorl	%esi, %esi
00000000001cfc57	movq	-0x88(%rbp), %rdx
00000000001cfc5e	callq	*0x78(%rax)
00000000001cfc61	movq	-0x88(%rbp), %rdi
00000000001cfc68	movq	(%rdi), %rax
00000000001cfc6b	callq	*0x18(%rax)
00000000001cfc6e	jmp	0x1cf37f
00000000001cfc73	nopw	%cs:(%rax,%rax)
00000000001cfc80	cmpl	$0x1, %eax
00000000001cfc83	jne	0x1d0080
00000000001cfc89	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001cfc8e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cfc93	movq	%rax, %r12
00000000001cfc96	movq	%rax, %rdi
00000000001cfc99	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001cfc9e	movq	-0x78(%rbp), %rax
00000000001cfca2	movzbl	0x1da(%rax), %esi
00000000001cfca9	movq	%r12, %rdi
00000000001cfcac	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001cfcb1	movq	%r12, %rdi
00000000001cfcb4	xorl	%esi, %esi
00000000001cfcb6	xorl	%edx, %edx
00000000001cfcb8	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001cfcbd	movq	-0x78(%rbp), %rax
00000000001cfcc1	movss	0x1dc(%rax), %xmm0
00000000001cfcc9	movss	0x1e0(%rax), %xmm1
00000000001cfcd1	movq	%r12, %rdi
00000000001cfcd4	callq	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff ## HGColorGamma::Set1DLutScaleAndOffset(float, float)
00000000001cfcd9	movq	-0x78(%rbp), %rax
00000000001cfcdd	movl	0x1b4(%rax), %esi
00000000001cfce3	movq	%r12, %rdi
00000000001cfce6	callq	__ZN12HGColorGamma18SetToneQualityModeENS_23hgColorGammaToneQualityE ## HGColorGamma::SetToneQualityMode(HGColorGamma::hgColorGammaToneQuality)
00000000001cfceb	movq	-0x78(%rbp), %rax
00000000001cfcef	movzbl	0x1b0(%rax), %esi
00000000001cfcf6	movq	%r12, %rdi
00000000001cfcf9	callq	__ZN12HGColorGamma15SetFallbackModeEb ## HGColorGamma::SetFallbackMode(bool)
00000000001cfcfe	movq	-0x78(%rbp), %rax
00000000001cfd02	movl	0x1c4(%rax), %esi
00000000001cfd08	movq	%r12, %rdi
00000000001cfd0b	callq	__ZN12HGColorGamma21SetInOut422FilterModeENS_30hgColorGammaInOut422FilterModeE ## HGColorGamma::SetInOut422FilterMode(HGColorGamma::hgColorGammaInOut422FilterMode)
00000000001cfd10	movq	-0x78(%rbp), %rax
00000000001cfd14	movq	0x1c8(%rax), %rsi
00000000001cfd1b	movq	0x1d0(%rax), %rdx
00000000001cfd22	movq	%r12, %rdi
00000000001cfd25	callq	__ZN12HGColorGamma21SetInOut422FilterRectE6HGRect ## HGColorGamma::SetInOut422FilterRect(HGRect)
00000000001cfd2a	movq	-0x78(%rbp), %rax
00000000001cfd2e	movzbl	0x1b2(%rax), %esi
00000000001cfd35	movq	%r12, %rdi
00000000001cfd38	callq	__ZN12HGColorGamma26SetFixedPointPrecisionModeEb ## HGColorGamma::SetFixedPointPrecisionMode(bool)
00000000001cfd3d	movq	(%r13), %rax
00000000001cfd41	movq	0x8(%r13), %rcx
00000000001cfd45	subq	%rax, %rcx
00000000001cfd48	sarq	$0x3, %rcx
00000000001cfd4c	cmpq	%r14, %rcx
00000000001cfd4f	jbe	0x1d0687
00000000001cfd55	movq	(%rax,%r14,8), %rax
00000000001cfd59	movaps	0x10(%rax), %xmm0
00000000001cfd5d	movaps	%xmm0, -0x70(%rbp)
00000000001cfd61	movq	(%r13), %rax
00000000001cfd65	movq	0x8(%r13), %rcx
00000000001cfd69	subq	%rax, %rcx
00000000001cfd6c	sarq	$0x3, %rcx
00000000001cfd70	cmpq	%r14, %rcx
00000000001cfd73	jbe	0x1d06a5
00000000001cfd79	movq	(%rax,%r14,8), %rax
00000000001cfd7d	movaps	0x20(%rax), %xmm0
00000000001cfd81	movaps	%xmm0, -0x60(%rbp)
00000000001cfd85	movq	(%r13), %rax
00000000001cfd89	movq	0x8(%r13), %rcx
00000000001cfd8d	subq	%rax, %rcx
00000000001cfd90	sarq	$0x3, %rcx
00000000001cfd94	cmpq	%r14, %rcx
00000000001cfd97	jbe	0x1d0691
00000000001cfd9d	movq	(%rax,%r14,8), %rax
00000000001cfda1	movaps	0x30(%rax), %xmm0
00000000001cfda5	movaps	%xmm0, -0x50(%rbp)
00000000001cfda9	movq	(%r13), %rax
00000000001cfdad	movq	0x8(%r13), %rcx
00000000001cfdb1	subq	%rax, %rcx
00000000001cfdb4	sarq	$0x3, %rcx
00000000001cfdb8	cmpq	%r14, %rcx
00000000001cfdbb	jbe	0x1d069b
00000000001cfdc1	cmpl	$0x0, -0x80(%rbp)
00000000001cfdc5	sete	%bl
00000000001cfdc8	movq	(%rax,%r14,8), %rax
00000000001cfdcc	movaps	0x40(%rax), %xmm0
00000000001cfdd0	movaps	%xmm0, -0x40(%rbp)
00000000001cfdd4	movq	%r12, %rdi
00000000001cfdd7	leaq	-0x70(%rbp), %rsi
00000000001cfddb	callq	__ZN12HGColorGamma11LoadMatrix1EPKDv4_f ## HGColorGamma::LoadMatrix1(float vector[4] const*)
00000000001cfde0	testb	%bl, %bl
00000000001cfde2	jne	0x1cf374
00000000001cfde8	movq	(%r12), %rax
00000000001cfdec	movq	%r12, %rdi
00000000001cfdef	xorl	%esi, %esi
00000000001cfdf1	movq	-0x88(%rbp), %rdx
00000000001cfdf8	callq	*0x78(%rax)
00000000001cfdfb	movq	-0x88(%rbp), %rdi
00000000001cfe02	movq	(%rdi), %rax
00000000001cfe05	callq	*0x18(%rax)
00000000001cfe08	jmp	0x1cf37f
00000000001cfe0d	cmpl	$0x8, %eax
00000000001cfe10	je	0x1d00a7
00000000001cfe16	cmpl	$0x7, %eax
00000000001cfe19	jne	0x1d0080
00000000001cfe1f	movl	$0x1d0, %edi                    ## imm = 0x1D0
00000000001cfe24	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001cfe29	movq	%rax, %r12
00000000001cfe2c	movq	%rax, %rdi
00000000001cfe2f	callq	__ZN12HGApply1DLUTC1Ev          ## HGApply1DLUT::HGApply1DLUT()
00000000001cfe34	movq	(%r13), %rax
00000000001cfe38	movq	0x8(%r13), %rcx
00000000001cfe3c	subq	%rax, %rcx
00000000001cfe3f	sarq	$0x3, %rcx
00000000001cfe43	cmpq	%r14, %rcx
00000000001cfe46	jbe	0x1d0742
00000000001cfe4c	movq	(%rax,%r14,8), %rax
00000000001cfe50	movl	0xc8(%rax), %esi
00000000001cfe56	movzbl	0xd8(%rax), %r9d
00000000001cfe5e	movl	$0x1, 0x8(%rsp)
00000000001cfe66	movl	$0x1, (%rsp)
00000000001cfe6d	xorps	%xmm1, %xmm1
00000000001cfe70	movq	%r12, %rdi
00000000001cfe73	movss	0x1f7e45(%rip), %xmm0
00000000001cfe7b	movl	$0x1, %edx
00000000001cfe80	movl	$0x1, %ecx
00000000001cfe85	movl	$0x1, %r8d
00000000001cfe8b	callq	__ZN12HGApply1DLUT4InitEjffbbbbbb ## HGApply1DLUT::Init(unsigned int, float, float, bool, bool, bool, bool, bool, bool)
00000000001cfe90	movzbl	__ZGVZN14HGColorConform29CreateColorConformHeliumGraphEP10HGRendererE10lutFactory(%rip), %eax ## guard variable for HGColorConform::CreateColorConformHeliumGraph(HGRenderer*)::lutFactory
00000000001cfe97	testb	%al, %al
00000000001cfe99	je	0x1d043b
00000000001cfe9f	movq	(%r13), %rax
00000000001cfea3	movq	0x8(%r13), %rcx
00000000001cfea7	subq	%rax, %rcx
00000000001cfeaa	sarq	$0x3, %rcx
00000000001cfeae	cmpq	%r14, %rcx
00000000001cfeb1	jbe	0x1d0731
00000000001cfeb7	movq	(%rax,%r14,8), %rax
00000000001cfebb	movq	0xd0(%rax), %r15
00000000001cfec2	testq	%r15, %r15
00000000001cfec5	je	0x1cfed0
00000000001cfec7	movq	(%r15), %rax
00000000001cfeca	movq	%r15, %rdi
00000000001cfecd	callq	*0x10(%rax)
00000000001cfed0	movl	$0x50, %edi
00000000001cfed5	movq	%r15, -0x98(%rbp)
00000000001cfedc	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001cfee1	movq	%rax, -0x90(%rbp)
00000000001cfee8	movq	%r15, -0xf0(%rbp)
00000000001cfeef	testq	%r15, %r15
00000000001cfef2	je	0x1cfefd
00000000001cfef4	movq	(%r15), %rax
00000000001cfef7	movq	%r15, %rdi
00000000001cfefa	callq	*0x10(%rax)
00000000001cfefd	movq	(%r13), %rax
00000000001cff01	movq	0x8(%r13), %rcx
00000000001cff05	subq	%rax, %rcx
00000000001cff08	sarq	$0x3, %rcx
00000000001cff0c	cmpq	%r14, %rcx
00000000001cff0f	jbe	0x1d073b
00000000001cff15	movq	(%rax,%r14,8), %rax
00000000001cff19	movslq	0xc8(%rax), %rdx
00000000001cff20	xorps	%xmm0, %xmm0
00000000001cff23	movaps	%xmm0, -0xd0(%rbp)
00000000001cff2a	movq	$0x0, -0xc0(%rbp)
00000000001cff35	movq	0xe0(%rax), %r15
00000000001cff3c	movq	0xe8(%rax), %r14
00000000001cff43	subq	%r15, %r14
00000000001cff46	je	0x1cff94
00000000001cff48	js	0x1d07a4
00000000001cff4e	movq	%rdx, -0xd8(%rbp)
00000000001cff55	movq	%r14, %rdi
00000000001cff58	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001cff5d	movq	%rax, -0xd0(%rbp)
00000000001cff64	movq	%rax, -0xc8(%rbp)
00000000001cff6b	movq	%rax, %rbx
00000000001cff6e	addq	%r14, %rbx
00000000001cff71	movq	%rbx, -0xc0(%rbp)
00000000001cff78	movq	%rax, %rdi
00000000001cff7b	movq	%r15, %rsi
00000000001cff7e	movq	%r14, %rdx
00000000001cff81	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000001cff86	movq	%rbx, -0xc8(%rbp)
00000000001cff8d	movq	-0xd8(%rbp), %rdx
00000000001cff94	movl	$0x1, %ecx
00000000001cff99	xorps	%xmm1, %xmm1
00000000001cff9c	movq	-0x90(%rbp), %rdi
00000000001cffa3	leaq	-0xf0(%rbp), %rsi
00000000001cffaa	leaq	-0xd0(%rbp), %r8
00000000001cffb1	movss	0x1f7d07(%rip), %xmm0
00000000001cffb9	movl	$0x1, %r9d
00000000001cffbf	callq	__ZN21HGColorConformLUTInfoC2E5HGRefI21HGColorConformLUTDataEmmNSt3__16vectorIhNS3_9allocatorIhEEEEffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGColorConformLUTInfo::HGColorConformLUTInfo(HGRef<HGColorConformLUTData>, unsigned long, unsigned long, std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000001cffc4	movq	-0xd0(%rbp), %rdi
00000000001cffcb	testq	%rdi, %rdi
00000000001cffce	movq	-0x98(%rbp), %r15
00000000001cffd5	je	0x1cffe3
00000000001cffd7	movq	%rdi, -0xc8(%rbp)
00000000001cffde	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001cffe3	movq	-0xf0(%rbp), %rdi
00000000001cffea	testq	%rdi, %rdi
00000000001cffed	je	0x1cfff5
00000000001cffef	movq	(%rdi), %rax
00000000001cfff2	callq	*0x18(%rax)
00000000001cfff5	movq	-0xf8(%rbp), %rax
00000000001cfffc	movq	0x228(%rax), %rdi
00000000001d0003	leaq	__ZZN14HGColorConform29CreateColorConformHeliumGraphEP10HGRendererE10lutFactory(%rip), %rsi ## HGColorConform::CreateColorConformHeliumGraph(HGRenderer*)::lutFactory
00000000001d000a	callq	__ZN17HGLUTCacheManager11getLUTCacheEPN10HGLUTCache15LUTEntryFactoryE ## HGLUTCacheManager::getLUTCache(HGLUTCache::LUTEntryFactory*)
00000000001d000f	movq	%rax, %rdi
00000000001d0012	movq	-0x90(%rbp), %rsi
00000000001d0019	callq	__ZN10HGLUTCache9getNewLUTEPNS_7LUTInfoE ## HGLUTCache::getNewLUT(HGLUTCache::LUTInfo*)
00000000001d001e	movq	%rax, %r14
00000000001d0021	movq	%r12, %rdi
00000000001d0024	movq	%rax, %rsi
00000000001d0027	callq	__ZN12HGApply1DLUT12SetLUTBitmapEP8HGBitmap ## HGApply1DLUT::SetLUTBitmap(HGBitmap*)
00000000001d002c	movq	(%r14), %rax
00000000001d002f	movq	%r14, %rdi
00000000001d0032	callq	*0x18(%rax)
00000000001d0035	movq	-0x90(%rbp), %rdi
00000000001d003c	movq	(%rdi), %rax
00000000001d003f	callq	*0x8(%rax)
00000000001d0042	cmpl	$0x0, -0x80(%rbp)
00000000001d0046	je	0x1d02f4
00000000001d004c	movq	(%r12), %rax
00000000001d0050	movq	%r12, %rdi
00000000001d0053	xorl	%esi, %esi
00000000001d0055	movq	-0x88(%rbp), %rdx
00000000001d005c	callq	*0x78(%rax)
00000000001d005f	movq	-0x88(%rbp), %rdi
00000000001d0066	movq	(%rdi), %rax
00000000001d0069	callq	*0x18(%rax)
00000000001d006c	jmp	0x1d02ff
00000000001d0071	nopw	%cs:(%rax,%rax)
00000000001d0080	movq	-0x88(%rbp), %r12
00000000001d0087	movq	-0x80(%rbp), %rsi
00000000001d008b	jmp	0x1cf385
00000000001d0090	movq	-0x78(%rbp), %rax
00000000001d0094	movq	%r12, 0x198(%rax)
00000000001d009b	movq	-0x80(%rbp), %rsi
00000000001d009f	addl	$0x2, %esi
00000000001d00a2	jmp	0x1cf385
00000000001d00a7	movzbl	__ZGVZN14HGColorConform29CreateColorConformHeliumGraphEP10HGRendererE10lutFactory_0(%rip), %eax ## guard variable for HGColorConform::CreateColorConformHeliumGraph(HGRenderer*)::lutFactory
00000000001d00ae	testb	%al, %al
00000000001d00b0	je	0x1d0431
00000000001d00b6	movq	-0xf8(%rbp), %rax
00000000001d00bd	movq	0x228(%rax), %rdi
00000000001d00c4	leaq	__ZZN14HGColorConform29CreateColorConformHeliumGraphEP10HGRendererE10lutFactory_0(%rip), %rsi ## HGColorConform::CreateColorConformHeliumGraph(HGRenderer*)::lutFactory
00000000001d00cb	callq	__ZN17HGLUTCacheManager11getLUTCacheEPN10HGLUTCache15LUTEntryFactoryE ## HGLUTCacheManager::getLUTCache(HGLUTCache::LUTEntryFactory*)
00000000001d00d0	movq	%rax, %rbx
00000000001d00d3	movq	(%r13), %rax
00000000001d00d7	movq	0x8(%r13), %rcx
00000000001d00db	subq	%rax, %rcx
00000000001d00de	sarq	$0x3, %rcx
00000000001d00e2	cmpq	%r14, %rcx
00000000001d00e5	jbe	0x1d0749
00000000001d00eb	movq	(%rax,%r14,8), %rax
00000000001d00ef	movl	0xcc(%rax), %eax
00000000001d00f5	cmpl	$0x19, %eax
00000000001d00f8	je	0x1d0103
00000000001d00fa	cmpl	$0x13, %eax
00000000001d00fd	jne	0x1d0340
00000000001d0103	movl	$0x210, %edi                    ## imm = 0x210
00000000001d0108	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001d010d	movq	%rax, %r12
00000000001d0110	movq	(%r13), %rax
00000000001d0114	movq	0x8(%r13), %rcx
00000000001d0118	subq	%rax, %rcx
00000000001d011b	sarq	$0x3, %rcx
00000000001d011f	cmpq	%r14, %rcx
00000000001d0122	jbe	0x1d0796
00000000001d0128	movq	(%rax,%r14,8), %rax
00000000001d012c	movslq	0xc8(%rax), %rsi
00000000001d0133	movl	$0x0, 0x10(%rsp)
00000000001d013b	movl	$0x1, 0x8(%rsp)
00000000001d0143	movl	$0x1, (%rsp)
00000000001d014a	xorps	%xmm1, %xmm1
00000000001d014d	xorps	%xmm2, %xmm2
00000000001d0150	xorps	%xmm4, %xmm4
00000000001d0153	xorps	%xmm5, %xmm5
00000000001d0156	movq	%r12, %rdi
00000000001d0159	movl	$0x19, %edx
00000000001d015e	movss	0x1f7b5a(%rip), %xmm0
00000000001d0166	movaps	%xmm0, %xmm3
00000000001d0169	movl	$0x1, %ecx
00000000001d016e	movl	$0x1, %r8d
00000000001d0174	movl	$0x1, %r9d
00000000001d017a	callq	__ZN12HGApply3DLUTC1Em8HGFormatffffffbNS_29hgApply3DLUTInterpolationTypeEbbbb ## HGApply3DLUT::HGApply3DLUT(unsigned long, HGFormat, float, float, float, float, float, float, bool, HGApply3DLUT::hgApply3DLUTInterpolationType, bool, bool, bool, bool)
00000000001d017f	movl	$0x50, %edi
00000000001d0184	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001d0189	movq	(%r13), %rsi
00000000001d018d	movq	0x8(%r13), %rcx
00000000001d0191	subq	%rsi, %rcx
00000000001d0194	sarq	$0x3, %rcx
00000000001d0198	cmpq	%r14, %rcx
00000000001d019b	movq	%rax, -0x90(%rbp)
00000000001d01a2	jbe	0x1d078f
00000000001d01a8	movq	(%rsi,%r14,8), %rdx
00000000001d01ac	movq	0xd0(%rdx), %rdi
00000000001d01b3	movq	%rdi, -0xe8(%rbp)
00000000001d01ba	testq	%rdi, %rdi
00000000001d01bd	je	0x1d01d4
00000000001d01bf	movq	(%rdi), %rax
00000000001d01c2	callq	*0x10(%rax)
00000000001d01c5	movq	(%r13), %rsi
00000000001d01c9	movq	0x8(%r13), %rcx
00000000001d01cd	subq	%rsi, %rcx
00000000001d01d0	sarq	$0x3, %rcx
00000000001d01d4	movq	%rbx, -0x98(%rbp)
00000000001d01db	cmpq	%r14, %rcx
00000000001d01de	jbe	0x1d079d
00000000001d01e4	movq	(%rsi,%r14,8), %rax
00000000001d01e8	movslq	0xc8(%rax), %rcx
00000000001d01ef	movq	%rcx, -0xd8(%rbp)
00000000001d01f6	xorps	%xmm0, %xmm0
00000000001d01f9	movaps	%xmm0, -0xb0(%rbp)
00000000001d0200	movq	$0x0, -0xa0(%rbp)
00000000001d020b	movq	0xe0(%rax), %r14
00000000001d0212	movq	0xe8(%rax), %r15
00000000001d0219	subq	%r14, %r15
00000000001d021c	je	0x1d025c
00000000001d021e	js	0x1d07ab
00000000001d0224	movq	%r15, %rdi
00000000001d0227	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001d022c	movq	%rax, -0xb0(%rbp)
00000000001d0233	movq	%rax, -0xa8(%rbp)
00000000001d023a	movq	%rax, %rbx
00000000001d023d	addq	%r15, %rbx
00000000001d0240	movq	%rbx, -0xa0(%rbp)
00000000001d0247	movq	%rax, %rdi
00000000001d024a	movq	%r14, %rsi
00000000001d024d	movq	%r15, %rdx
00000000001d0250	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000001d0255	movq	%rbx, -0xa8(%rbp)
00000000001d025c	movl	$0x3, %ecx
00000000001d0261	xorps	%xmm1, %xmm1
00000000001d0264	movq	-0x90(%rbp), %rbx
00000000001d026b	movq	%rbx, %rdi
00000000001d026e	leaq	-0xe8(%rbp), %rsi
00000000001d0275	movq	-0xd8(%rbp), %rdx
00000000001d027c	leaq	-0xb0(%rbp), %r8
00000000001d0283	movss	0x1f7a35(%rip), %xmm0
00000000001d028b	xorl	%r9d, %r9d
00000000001d028e	callq	__ZN21HGColorConformLUTInfoC2E5HGRefI21HGColorConformLUTDataEmmNSt3__16vectorIhNS3_9allocatorIhEEEEffN16HGApplyNDLUTInfo16LUTStorageFormatE ## HGColorConformLUTInfo::HGColorConformLUTInfo(HGRef<HGColorConformLUTData>, unsigned long, unsigned long, std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000001d0293	movq	-0xb0(%rbp), %rdi
00000000001d029a	testq	%rdi, %rdi
00000000001d029d	movq	-0x98(%rbp), %r14
00000000001d02a4	je	0x1d02b2
00000000001d02a6	movq	%rdi, -0xa8(%rbp)
00000000001d02ad	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d02b2	movq	-0xe8(%rbp), %rdi
00000000001d02b9	testq	%rdi, %rdi
00000000001d02bc	je	0x1d02c4
00000000001d02be	movq	(%rdi), %rax
00000000001d02c1	callq	*0x18(%rax)
00000000001d02c4	movq	%r14, %rdi
00000000001d02c7	movq	%rbx, %rsi
00000000001d02ca	callq	__ZN10HGLUTCache9getNewLUTEPNS_7LUTInfoE ## HGLUTCache::getNewLUT(HGLUTCache::LUTInfo*)
00000000001d02cf	movq	%rax, %r14
00000000001d02d2	movq	%r12, %rdi
00000000001d02d5	movq	%rax, %rsi
00000000001d02d8	callq	__ZN12HGApply3DLUT12SetLUTBitmapEP8HGBitmap ## HGApply3DLUT::SetLUTBitmap(HGBitmap*)
00000000001d02dd	movq	(%r14), %rax
00000000001d02e0	movq	%r14, %rdi
00000000001d02e3	callq	*0x18(%rax)
00000000001d02e6	movq	(%rbx), %rax
00000000001d02e9	movq	%rbx, %rdi
00000000001d02ec	callq	*0x8(%rax)
00000000001d02ef	jmp	0x1d0402
00000000001d02f4	movq	-0x78(%rbp), %rax
00000000001d02f8	movq	%r12, 0x198(%rax)
00000000001d02ff	movq	-0x80(%rbp), %rax
00000000001d0303	incl	%eax
00000000001d0305	movq	%rax, -0x80(%rbp)
00000000001d0309	testq	%r15, %r15
00000000001d030c	je	0x1d0320
00000000001d030e	movq	(%r15), %rax
00000000001d0311	movq	%r15, %rdi
00000000001d0314	callq	*0x18(%rax)
00000000001d0317	movq	-0x80(%rbp), %rsi
00000000001d031b	jmp	0x1cf385
00000000001d0320	movq	-0x80(%rbp), %rsi
00000000001d0324	jmp	0x1cf385
00000000001d0329	movq	-0x78(%rbp), %rax
00000000001d032d	movq	%r12, 0x198(%rax)
00000000001d0334	movq	-0x80(%rbp), %rsi
00000000001d0338	addl	$0x3, %esi
00000000001d033b	jmp	0x1cf385
00000000001d0340	movl	$0x210, %edi                    ## imm = 0x210
00000000001d0345	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001d034a	movq	%rax, %r12
00000000001d034d	movq	(%r13), %rax
00000000001d0351	movq	0x8(%r13), %rcx
00000000001d0355	subq	%rax, %rcx
00000000001d0358	sarq	$0x3, %rcx
00000000001d035c	cmpq	%r14, %rcx
00000000001d035f	jbe	0x1d07b2
00000000001d0365	movq	(%rax,%r14,8), %rax
00000000001d0369	movslq	0xc8(%rax), %rsi
00000000001d0370	movl	0xcc(%rax), %edx
00000000001d0376	movl	$0x0, 0x10(%rsp)
00000000001d037e	movl	$0x1, 0x8(%rsp)
00000000001d0386	movl	$0x1, (%rsp)
00000000001d038d	xorps	%xmm1, %xmm1
00000000001d0390	xorps	%xmm2, %xmm2
00000000001d0393	xorps	%xmm4, %xmm4
00000000001d0396	xorps	%xmm5, %xmm5
00000000001d0399	movq	%r12, %rdi
00000000001d039c	movss	0x1f791c(%rip), %xmm0
00000000001d03a4	movaps	%xmm0, %xmm3
00000000001d03a7	movl	$0x1, %ecx
00000000001d03ac	movl	$0x1, %r8d
00000000001d03b2	movl	$0x1, %r9d
00000000001d03b8	callq	__ZN12HGApply3DLUTC1Em8HGFormatffffffbNS_29hgApply3DLUTInterpolationTypeEbbbb ## HGApply3DLUT::HGApply3DLUT(unsigned long, HGFormat, float, float, float, float, float, float, bool, HGApply3DLUT::hgApply3DLUTInterpolationType, bool, bool, bool, bool)
00000000001d03bd	movq	(%r13), %rax
00000000001d03c1	movq	0x8(%r13), %rcx
00000000001d03c5	subq	%rax, %rcx
00000000001d03c8	sarq	$0x3, %rcx
00000000001d03cc	cmpq	%r14, %rcx
00000000001d03cf	jbe	0x1d07b9
00000000001d03d5	movq	(%rax,%r14,8), %rax
00000000001d03d9	movq	0xd0(%rax), %rcx
00000000001d03e0	movq	0x18(%rcx), %rsi
00000000001d03e4	movl	0xc8(%rax), %edx
00000000001d03ea	movl	0xc0(%rax), %ecx
00000000001d03f0	movl	0xc4(%rax), %r8d
00000000001d03f7	movq	%r12, %rdi
00000000001d03fa	xorl	%r9d, %r9d
00000000001d03fd	callq	__ZN12HGApply3DLUT6SetLUTEPviii8HGFormat ## HGApply3DLUT::SetLUT(void*, int, int, int, HGFormat)
00000000001d0402	cmpl	$0x0, -0x80(%rbp)
00000000001d0406	je	0x1cf374
00000000001d040c	movq	(%r12), %rax
00000000001d0410	movq	%r12, %rdi
00000000001d0413	xorl	%esi, %esi
00000000001d0415	movq	-0x88(%rbp), %rdx
00000000001d041c	callq	*0x78(%rax)
00000000001d041f	movq	-0x88(%rbp), %rdi
00000000001d0426	movq	(%rdi), %rax
00000000001d0429	callq	*0x18(%rax)
00000000001d042c	jmp	0x1cf37f
00000000001d0431	callq	__ZN14HGColorConform29CreateColorConformHeliumGraphEP10HGRenderer.cold.1 ## HGColorConform::CreateColorConformHeliumGraph(HGRenderer*) (.cold.1)
00000000001d0436	jmp	0x1d00b6
00000000001d043b	callq	__ZN14HGColorConform29CreateColorConformHeliumGraphEP10HGRenderer.cold.2 ## HGColorConform::CreateColorConformHeliumGraph(HGRenderer*) (.cold.2)
00000000001d0440	jmp	0x1cfe9f
00000000001d0445	xorl	%eax, %eax
00000000001d0447	movq	0x831e0a(%rip), %rcx            ## literal pool symbol address: ___stack_chk_guard
00000000001d044e	movq	(%rcx), %rcx
00000000001d0451	cmpq	-0x30(%rbp), %rcx
00000000001d0455	jne	0x1d0650
00000000001d045b	addq	$0xe8, %rsp
00000000001d0462	popq	%rbx
00000000001d0463	popq	%r12
00000000001d0465	popq	%r13
00000000001d0467	popq	%r14
00000000001d0469	popq	%r15
00000000001d046b	popq	%rbp
00000000001d046c	retq
00000000001d046d	xorl	%r12d, %r12d
00000000001d0470	movq	-0x78(%rbp), %rax
00000000001d0474	movq	%r12, 0x1a0(%rax)
00000000001d047b	movq	0x198(%rax), %rdi
00000000001d0482	testq	%rdi, %rdi
00000000001d0485	je	0x1d04ae
00000000001d0487	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000001d048e	leaq	__ZTI12HGColorGamma(%rip), %rdx ## typeinfo for HGColorGamma
00000000001d0495	xorl	%ecx, %ecx
00000000001d0497	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000001d049c	movq	%rax, %r14
00000000001d049f	testq	%rax, %rax
00000000001d04a2	je	0x1d04ae
00000000001d04a4	testq	%r12, %r12
00000000001d04a7	jne	0x1d050f
00000000001d04a9	jmp	0x1d052f
00000000001d04ae	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001d04b3	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001d04b8	movq	%rax, %r14
00000000001d04bb	movq	%rax, %rdi
00000000001d04be	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001d04c3	movq	-0x78(%rbp), %rax
00000000001d04c7	movzbl	0x1da(%rax), %esi
00000000001d04ce	movq	%r14, %rdi
00000000001d04d1	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001d04d6	movq	-0x78(%rbp), %rax
00000000001d04da	movq	0x198(%rax), %rdi
00000000001d04e1	movq	(%rdi), %rax
00000000001d04e4	xorl	%esi, %esi
00000000001d04e6	movq	%r14, %rdx
00000000001d04e9	callq	*0x78(%rax)
00000000001d04ec	movq	(%r14), %rax
00000000001d04ef	movq	%r14, %rdi
00000000001d04f2	callq	*0x18(%rax)
00000000001d04f5	movq	-0x78(%rbp), %rcx
00000000001d04f9	leaq	0x198(%rcx), %rax
00000000001d0500	movq	%r14, (%rax)
00000000001d0503	movq	0x1a0(%rcx), %r12
00000000001d050a	testq	%r12, %r12
00000000001d050d	je	0x1d052f
00000000001d050f	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000001d0516	leaq	__ZTI12HGColorGamma(%rip), %rdx ## typeinfo for HGColorGamma
00000000001d051d	movq	%r12, %rdi
00000000001d0520	xorl	%ecx, %ecx
00000000001d0522	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000001d0527	movq	%rax, %r15
00000000001d052a	testq	%rax, %rax
00000000001d052d	jne	0x1d0584
00000000001d052f	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001d0534	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001d0539	movq	%rax, %r15
00000000001d053c	movq	%rax, %rdi
00000000001d053f	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001d0544	movq	-0x78(%rbp), %rax
00000000001d0548	movzbl	0x1da(%rax), %esi
00000000001d054f	movq	%r15, %rdi
00000000001d0552	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001d0557	movq	-0x78(%rbp), %rax
00000000001d055b	movq	0x1a0(%rax), %rdx
00000000001d0562	movq	(%r15), %rax
00000000001d0565	movq	%r15, %rdi
00000000001d0568	xorl	%esi, %esi
00000000001d056a	callq	*0x78(%rax)
00000000001d056d	movq	-0x78(%rbp), %rax
00000000001d0571	leaq	0x1a0(%rax), %rbx
00000000001d0578	movq	(%rbx), %rdi
00000000001d057b	movq	(%rdi), %rax
00000000001d057e	callq	*0x18(%rax)
00000000001d0581	movq	%r15, (%rbx)
00000000001d0584	movq	-0x78(%rbp), %rax
00000000001d0588	movl	0x1bc(%rax), %esi
00000000001d058e	movq	%r14, %rdi
00000000001d0591	callq	__ZN12HGColorGamma19SetInputPixelFormatE13HGYCbCrFormat ## HGColorGamma::SetInputPixelFormat(HGYCbCrFormat)
00000000001d0596	movq	-0x78(%rbp), %rax
00000000001d059a	movl	0x1b8(%rax), %esi
00000000001d05a0	movl	0x1c0(%rax), %edx
00000000001d05a6	movq	%r15, %rdi
00000000001d05a9	callq	__ZN12HGColorGamma20SetOutputPixelFormatE8HGFormat13HGYCbCrFormat ## HGColorGamma::SetOutputPixelFormat(HGFormat, HGYCbCrFormat)
00000000001d05ae	movq	-0x78(%rbp), %rax
00000000001d05b2	movzbl	0x1b1(%rax), %esi
00000000001d05b9	movq	%r15, %rdi
00000000001d05bc	callq	__ZN12HGColorGamma13SetDitherModeEb ## HGColorGamma::SetDitherMode(bool)
00000000001d05c1	movq	-0x78(%rbp), %rax
00000000001d05c5	movzbl	0x1b2(%rax), %esi
00000000001d05cc	movq	%r14, %rdi
00000000001d05cf	callq	__ZN12HGColorGamma26SetFixedPointPrecisionModeEb ## HGColorGamma::SetFixedPointPrecisionMode(bool)
00000000001d05d4	movq	-0x78(%rbp), %rax
00000000001d05d8	addq	$0x1b2, %rax                    ## imm = 0x1B2
00000000001d05de	movzbl	(%rax), %esi
00000000001d05e1	movq	%r15, %rdi
00000000001d05e4	callq	__ZN12HGColorGamma26SetFixedPointPrecisionModeEb ## HGColorGamma::SetFixedPointPrecisionMode(bool)
00000000001d05e9	movq	-0x78(%rbp), %rdx
00000000001d05ed	movq	0x198(%rdx), %rcx
00000000001d05f4	movzbl	0x1d8(%rdx), %eax
00000000001d05fb	cmpq	0x1a0(%rdx), %rcx
00000000001d0602	je	0x1d0628
00000000001d0604	movzbl	%al, %esi
00000000001d0607	movq	%r14, %rdi
00000000001d060a	xorl	%edx, %edx
00000000001d060c	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001d0611	movq	-0x78(%rbp), %rax
00000000001d0615	movzbl	0x1d9(%rax), %edx
00000000001d061c	movq	%r15, %rdi
00000000001d061f	xorl	%esi, %esi
00000000001d0621	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001d0626	jmp	0x1d063a
00000000001d0628	movzbl	0x1d9(%rdx), %edx
00000000001d062f	movzbl	%al, %esi
00000000001d0632	movq	%r14, %rdi
00000000001d0635	callq	__ZN12HGColorGamma19SetPremultiplyStateEbb ## HGColorGamma::SetPremultiplyState(bool, bool)
00000000001d063a	movb	$0x1, %al
00000000001d063c	movq	0x831c15(%rip), %rcx            ## literal pool symbol address: ___stack_chk_guard
00000000001d0643	movq	(%rcx), %rcx
00000000001d0646	cmpq	-0x30(%rbp), %rcx
00000000001d064a	je	0x1d045b
00000000001d0650	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
00000000001d0655	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d065a	jmp	0x1d07be
00000000001d065f	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0664	jmp	0x1d07be
00000000001d0669	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d066e	jmp	0x1d07be
00000000001d0673	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0678	jmp	0x1d07be
00000000001d067d	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0682	jmp	0x1d07be
00000000001d0687	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d068c	jmp	0x1d07be
00000000001d0691	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0696	jmp	0x1d07be
00000000001d069b	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d06a0	jmp	0x1d07be
00000000001d06a5	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d06aa	jmp	0x1d07be
00000000001d06af	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d06b4	jmp	0x1d07be
00000000001d06b9	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d06be	jmp	0x1d07be
00000000001d06c3	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d06c8	jmp	0x1d07be
00000000001d06cd	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d06d2	jmp	0x1d07be
00000000001d06d7	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d06dc	jmp	0x1d07be
00000000001d06e1	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d06e6	jmp	0x1d07be
00000000001d06eb	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d06f0	jmp	0x1d07be
00000000001d06f5	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d06fa	jmp	0x1d07be
00000000001d06ff	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0704	jmp	0x1d07be
00000000001d0709	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d070e	jmp	0x1d07be
00000000001d0713	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0718	jmp	0x1d07be
00000000001d071d	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0722	jmp	0x1d07be
00000000001d0727	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d072c	jmp	0x1d07be
00000000001d0731	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0736	jmp	0x1d07be
00000000001d073b	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0740	jmp	0x1d07be
00000000001d0742	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0747	jmp	0x1d07be
00000000001d0749	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d074e	jmp	0x1d07be
00000000001d0750	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0755	jmp	0x1d07be
00000000001d0757	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d075c	jmp	0x1d07be
00000000001d075e	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0763	jmp	0x1d07be
00000000001d0765	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d076a	jmp	0x1d07be
00000000001d076c	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0771	jmp	0x1d07be
00000000001d0773	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0778	jmp	0x1d07be
00000000001d077a	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d077f	jmp	0x1d07be
00000000001d0781	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0786	jmp	0x1d07be
00000000001d0788	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d078d	jmp	0x1d07be
00000000001d078f	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d0794	jmp	0x1d07be
00000000001d0796	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d079b	jmp	0x1d07be
00000000001d079d	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d07a2	jmp	0x1d07be
00000000001d07a4	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::__throw_length_error[abi:nqe210106]()
00000000001d07a9	jmp	0x1d07be
00000000001d07ab	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::__throw_length_error[abi:nqe210106]()
00000000001d07b0	jmp	0x1d07be
00000000001d07b2	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d07b7	jmp	0x1d07be
00000000001d07b9	callq	__ZNSt3__16vectorIP26HGColorConformNodeListItemNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGColorConformNodeListItem*, std::__1::allocator<HGColorConformNodeListItem*>>::__throw_out_of_range[abi:nqe210106]()
00000000001d07be	ud2
00000000001d07c0	jmp	0x1d08d1
00000000001d07c5	jmp	0x1d08d1
00000000001d07ca	jmp	0x1d0828
00000000001d07cc	movq	%rax, %rbx
00000000001d07cf	jmp	0x1d0843
00000000001d07d1	jmp	0x1d0860
00000000001d07d6	jmp	0x1d0901
00000000001d07db	movq	%rax, %rbx
00000000001d07de	movq	%r15, %rdi
00000000001d07e1	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001d07e6	movq	%rbx, %rdi
00000000001d07e9	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d07ee	movq	%rax, %rbx
00000000001d07f1	movq	%r14, %rdi
00000000001d07f4	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001d07f9	movq	%rbx, %rdi
00000000001d07fc	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d0801	jmp	0x1d0901
00000000001d0806	movq	%rax, %rbx
00000000001d0809	movq	-0x90(%rbp), %rdi
00000000001d0810	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d0815	jmp	0x1d08ec
00000000001d081a	jmp	0x1d0901
00000000001d081f	jmp	0x1d087b
00000000001d0821	jmp	0x1d0898
00000000001d0823	movq	%rax, %rbx
00000000001d0826	jmp	0x1d0843
00000000001d0828	movq	%rax, %rbx
00000000001d082b	movq	-0xb0(%rbp), %rdi
00000000001d0832	testq	%rdi, %rdi
00000000001d0835	je	0x1d0843
00000000001d0837	movq	%rdi, -0xa8(%rbp)
00000000001d083e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d0843	movq	-0xe8(%rbp), %rdi
00000000001d084a	testq	%rdi, %rdi
00000000001d084d	je	0x1d0863
00000000001d084f	movq	(%rdi), %rax
00000000001d0852	callq	*0x18(%rax)
00000000001d0855	jmp	0x1d0863
00000000001d0857	jmp	0x1d0901
00000000001d085c	jmp	0x1d08d1
00000000001d085e	jmp	0x1d08d1
00000000001d0860	movq	%rax, %rbx
00000000001d0863	movq	-0x90(%rbp), %rdi
00000000001d086a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d086f	movq	%rbx, %rdi
00000000001d0872	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d0877	jmp	0x1d08d1
00000000001d0879	jmp	0x1d08d1
00000000001d087b	movq	%rax, %rbx
00000000001d087e	movq	-0xd0(%rbp), %rdi
00000000001d0885	testq	%rdi, %rdi
00000000001d0888	je	0x1d089b
00000000001d088a	movq	%rdi, -0xc8(%rbp)
00000000001d0891	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d0896	jmp	0x1d089b
00000000001d0898	movq	%rax, %rbx
00000000001d089b	movq	-0xf0(%rbp), %rdi
00000000001d08a2	testq	%rdi, %rdi
00000000001d08a5	je	0x1d08ad
00000000001d08a7	movq	(%rdi), %rax
00000000001d08aa	callq	*0x18(%rax)
00000000001d08ad	movq	-0x90(%rbp), %rdi
00000000001d08b4	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001d08b9	cmpq	$0x0, -0x98(%rbp)
00000000001d08c1	jne	0x1d08ec
00000000001d08c3	jmp	0x1d08f9
00000000001d08c5	jmp	0x1d0901
00000000001d08c7	jmp	0x1d08e4
00000000001d08c9	jmp	0x1d08e4
00000000001d08cb	jmp	0x1d08d1
00000000001d08cd	jmp	0x1d08d1
00000000001d08cf	jmp	0x1d08d1
00000000001d08d1	movq	%rax, %rbx
00000000001d08d4	movq	%r12, %rdi
00000000001d08d7	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001d08dc	movq	%rbx, %rdi
00000000001d08df	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d08e4	movq	%rax, %rbx
00000000001d08e7	testq	%r15, %r15
00000000001d08ea	je	0x1d08f9
00000000001d08ec	movq	-0x98(%rbp), %rdi
00000000001d08f3	movq	(%rdi), %rax
00000000001d08f6	callq	*0x18(%rax)
00000000001d08f9	movq	%rbx, %rdi
00000000001d08fc	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d0901	testl	%edx, %edx
00000000001d0903	je	0x1d090d
00000000001d0905	movq	%rax, %rdi
00000000001d0908	callq	___clang_call_terminate
00000000001d090d	movq	%rax, %rdi
00000000001d0910	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d0915	nopw	%cs:(%rax,%rax)
