__ZNK33HGArriLogCDefaultToneCurveLUTInfo12colorAtIndexEfffPfS0_S0_S0_:
0000000000113270	xorps	%xmm1, %xmm1
0000000000113273	ucomiss	%xmm0, %xmm1
0000000000113276	jae	0x11344c
000000000011327c	movss	0x2b4a3c(%rip), %xmm1
0000000000113284	ucomiss	%xmm1, %xmm0
0000000000113287	jae	0x11344c
000000000011328d	xorps	%xmm1, %xmm1
0000000000113290	cvtss2sd	%xmm0, %xmm1
0000000000113294	movsd	0x2c1774(%rip), %xmm2
000000000011329c	ucomisd	%xmm1, %xmm2
00000000001132a0	jbe	0x1132a6
00000000001132a2	xorl	%eax, %eax
00000000001132a4	jmp	0x1132f6
00000000001132a6	movl	$0x1, %eax
00000000001132ab	movsd	0x2c1765(%rip), %xmm2
00000000001132b3	ucomisd	%xmm1, %xmm2
00000000001132b7	ja	0x1132f6
00000000001132b9	movl	$0x2, %eax
00000000001132be	movsd	0x2c175a(%rip), %xmm2
00000000001132c6	ucomisd	%xmm1, %xmm2
00000000001132ca	ja	0x1132f6
00000000001132cc	movl	$0x3, %eax
00000000001132d1	movsd	0x2c174f(%rip), %xmm2
00000000001132d9	ucomisd	%xmm1, %xmm2
00000000001132dd	ja	0x1132f6
00000000001132df	movl	$0x4, %eax
00000000001132e4	movss	0x2b49d4(%rip), %xmm2
00000000001132ec	ucomiss	%xmm0, %xmm2
00000000001132ef	ja	0x1132f6
00000000001132f1	movl	$0x5, %eax
00000000001132f6	pushq	%rbp
00000000001132f7	movq	%rsp, %rbp
00000000001132fa	pushq	%r15
00000000001132fc	pushq	%r14
00000000001132fe	pushq	%r12
0000000000113300	pushq	%rbx
0000000000113301	subq	$0x10, %rsp
0000000000113305	shll	$0x3, %eax
0000000000113308	leaq	__ZN33HGArriLogCDefaultToneCurveLUTInfo2xiE(%rip), %r9 ## HGArriLogCDefaultToneCurveLUTInfo::xi
000000000011330f	subsd	(%rax,%r9), %xmm1
0000000000113315	movsd	0x50(%rdi,%rax), %xmm0
000000000011331b	mulsd	%xmm1, %xmm0
000000000011331f	addsd	0x28(%rdi,%rax), %xmm0
0000000000113325	mulsd	%xmm1, %xmm0
0000000000113329	leaq	__ZN33HGArriLogCDefaultToneCurveLUTInfo2a1E(%rip), %r9 ## HGArriLogCDefaultToneCurveLUTInfo::a1
0000000000113330	addsd	(%rax,%r9), %xmm0
0000000000113336	mulsd	%xmm1, %xmm0
000000000011333a	leaq	__ZN33HGArriLogCDefaultToneCurveLUTInfo2a0E(%rip), %r9 ## HGArriLogCDefaultToneCurveLUTInfo::a0
0000000000113341	addsd	(%rax,%r9), %xmm0
0000000000113347	cmpb	$0x1, 0x78(%rdi)
000000000011334b	jne	0x1133a4
000000000011334d	movzbl	__ZGVZNK33HGArriLogCDefaultToneCurveLUTInfo12colorAtIndexEfffPfS0_S0_S0_E1c(%rip), %eax ## guard variable for HGArriLogCDefaultToneCurveLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::c
0000000000113354	testb	%al, %al
0000000000113356	je	0x1133f4
000000000011335c	ucomisd	0x2c16cc(%rip), %xmm0
0000000000113364	jbe	0x113429
000000000011336a	addsd	0x2c16c6(%rip), %xmm0
0000000000113372	divsd	0x2c16c6(%rip), %xmm0
000000000011337a	movsd	0x2c16c6(%rip), %xmm1
0000000000113382	movq	%r8, %rbx
0000000000113385	movq	%rcx, %r15
0000000000113388	movq	%rdx, %r14
000000000011338b	movq	%rsi, %r12
000000000011338e	callq	0x3c54ec                        ## symbol stub for: _pow
0000000000113393	movq	%r12, %rsi
0000000000113396	movq	%r14, %rdx
0000000000113399	movq	%r15, %rcx
000000000011339c	movq	%rbx, %r8
000000000011339f	jmp	0x113439
00000000001133a4	movq	%rsi, %rbx
00000000001133a7	movq	%rdx, %r14
00000000001133aa	movq	%rcx, %r15
00000000001133ad	movq	%r8, %r12
00000000001133b0	xorpd	%xmm1, %xmm1
00000000001133b4	ucomisd	%xmm1, %xmm0
00000000001133b8	jae	0x1133d9
00000000001133ba	xorpd	0x2b771e(%rip), %xmm0
00000000001133c2	movsd	0x2bd99e(%rip), %xmm1
00000000001133ca	callq	0x3c54ec                        ## symbol stub for: _pow
00000000001133cf	xorpd	0x2b7709(%rip), %xmm0
00000000001133d7	jmp	0x1133e6
00000000001133d9	movsd	0x2bd987(%rip), %xmm1
00000000001133e1	callq	0x3c54ec                        ## symbol stub for: _pow
00000000001133e6	movq	%r12, %r8
00000000001133e9	movq	%r15, %rcx
00000000001133ec	movq	%r14, %rdx
00000000001133ef	movq	%rbx, %rsi
00000000001133f2	jmp	0x113439
00000000001133f4	movq	%r8, %rbx
00000000001133f7	movq	%rcx, %r15
00000000001133fa	movq	%rdx, %r14
00000000001133fd	movq	%rsi, %r12
0000000000113400	movapd	%xmm0, -0x30(%rbp)
0000000000113405	callq	__ZNK33HGArriLogCDefaultToneCurveLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.1 ## HGArriLogCDefaultToneCurveLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.1)
000000000011340a	movapd	-0x30(%rbp), %xmm0
000000000011340f	movq	%r12, %rsi
0000000000113412	movq	%r14, %rdx
0000000000113415	movq	%r15, %rcx
0000000000113418	movq	%rbx, %r8
000000000011341b	ucomisd	0x2c160d(%rip), %xmm0
0000000000113423	ja	0x11336a
0000000000113429	divsd	0x2c15ff(%rip), %xmm0
0000000000113431	mulsd	__ZZNK33HGArriLogCDefaultToneCurveLUTInfo12colorAtIndexEfffPfS0_S0_S0_E1c(%rip), %xmm0 ## HGArriLogCDefaultToneCurveLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::c
0000000000113439	xorps	%xmm1, %xmm1
000000000011343c	cvtsd2ss	%xmm0, %xmm1
0000000000113440	addq	$0x10, %rsp
0000000000113444	popq	%rbx
0000000000113445	popq	%r12
0000000000113447	popq	%r14
0000000000113449	popq	%r15
000000000011344b	popq	%rbp
000000000011344c	movss	%xmm1, (%rsi)
0000000000113450	movss	%xmm1, (%rdx)
0000000000113454	movss	%xmm1, (%rcx)
0000000000113458	movl	$0x3f800000, (%r8)              ## imm = 0x3F800000
000000000011345f	retq
