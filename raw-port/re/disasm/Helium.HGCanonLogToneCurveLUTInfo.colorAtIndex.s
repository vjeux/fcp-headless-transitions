__ZNK26HGCanonLogToneCurveLUTInfo12colorAtIndexEfffPfS0_S0_S0_:
00000000001139e0	pushq	%rbp
00000000001139e1	movq	%rsp, %rbp
00000000001139e4	pushq	%r15
00000000001139e6	pushq	%r14
00000000001139e8	pushq	%r13
00000000001139ea	pushq	%r12
00000000001139ec	pushq	%rbx
00000000001139ed	pushq	%rax
00000000001139ee	movq	%r8, %rbx
00000000001139f1	movq	%rcx, %r14
00000000001139f4	movq	%rdx, %r15
00000000001139f7	movq	%rsi, %r12
00000000001139fa	movzbl	__ZGVZNK26HGCanonLogToneCurveLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2aa(%rip), %eax ## guard variable for HGCanonLogToneCurveLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::aa
0000000000113a01	testb	%al, %al
0000000000113a03	je	0x113b26
0000000000113a09	cvtss2sd	%xmm0, %xmm1
0000000000113a0d	movsd	0x2c106b(%rip), %xmm0
0000000000113a15	xorl	%r13d, %r13d
0000000000113a18	ucomisd	%xmm0, %xmm1
0000000000113a1c	setb	%al
0000000000113a1f	jb	0x113a2f
0000000000113a21	addsd	0x2c105f(%rip), %xmm1
0000000000113a29	movapd	%xmm1, %xmm0
0000000000113a2d	jmp	0x113a33
0000000000113a2f	subsd	%xmm1, %xmm0
0000000000113a33	movb	%al, %r13b
0000000000113a36	mulsd	__ZZNK26HGCanonLogToneCurveLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2aa(%rip), %xmm0 ## HGCanonLogToneCurveLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const::aa
0000000000113a3e	callq	0x3c50ea                        ## symbol stub for: _exp
0000000000113a43	addsd	0x2b68b5(%rip), %xmm0
0000000000113a4b	leaq	0x2c0f7e(%rip), %rax
0000000000113a52	divsd	(%rax,%r13,8), %xmm0
0000000000113a58	ucomisd	0x2bd2e0(%rip), %xmm0
0000000000113a60	jae	0x113a8c
0000000000113a62	ucomisd	0x2c1036(%rip), %xmm0
0000000000113a6a	movsd	0x2c1036(%rip), %xmm3
0000000000113a72	jbe	0x113ac9
0000000000113a74	mulsd	0x2bd2cc(%rip), %xmm0
0000000000113a7c	movsd	0x2c1024(%rip), %xmm1
0000000000113a84	ucomisd	%xmm0, %xmm1
0000000000113a88	jbe	0x113ab7
0000000000113a8a	jmp	0x113ac9
0000000000113a8c	movsd	0x2bd2bc(%rip), %xmm1
0000000000113a94	callq	0x3c54ec                        ## symbol stub for: _pow
0000000000113a99	mulsd	0x2bd2b7(%rip), %xmm0
0000000000113aa1	addsd	0x2c0fe7(%rip), %xmm0
0000000000113aa9	movsd	0x2c0fe7(%rip), %xmm2
0000000000113ab1	ucomisd	%xmm2, %xmm0
0000000000113ab5	ja	0x113aec
0000000000113ab7	xorpd	%xmm1, %xmm1
0000000000113abb	ucomisd	%xmm1, %xmm0
0000000000113abf	movapd	%xmm0, %xmm2
0000000000113ac3	movapd	%xmm0, %xmm3
0000000000113ac7	jae	0x113aec
0000000000113ac9	xorpd	0x2b700f(%rip), %xmm3
0000000000113ad1	movsd	0x2c0fd7(%rip), %xmm1
0000000000113ad9	movapd	%xmm3, %xmm0
0000000000113add	callq	0x3c54ec                        ## symbol stub for: _pow
0000000000113ae2	xorpd	0x2b6ff6(%rip), %xmm0
0000000000113aea	jmp	0x113afd
0000000000113aec	movsd	0x2c0fbc(%rip), %xmm1
0000000000113af4	movapd	%xmm2, %xmm0
0000000000113af8	callq	0x3c54ec                        ## symbol stub for: _pow
0000000000113afd	cvtsd2ss	%xmm0, %xmm0
0000000000113b01	movss	%xmm0, (%r12)
0000000000113b07	movss	%xmm0, (%r15)
0000000000113b0c	movss	%xmm0, (%r14)
0000000000113b11	movl	$0x3f800000, (%rbx)             ## imm = 0x3F800000
0000000000113b17	addq	$0x8, %rsp
0000000000113b1b	popq	%rbx
0000000000113b1c	popq	%r12
0000000000113b1e	popq	%r13
0000000000113b20	popq	%r14
0000000000113b22	popq	%r15
0000000000113b24	popq	%rbp
0000000000113b25	retq
0000000000113b26	movss	%xmm0, -0x2c(%rbp)
0000000000113b2b	callq	__ZNK26HGCanonLogToneCurveLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.1 ## HGCanonLogToneCurveLUTInfo::colorAtIndex(float, float, float, float*, float*, float*, float*) const (.cold.1)
0000000000113b30	movss	-0x2c(%rbp), %xmm0
0000000000113b35	jmp	0x113a09
0000000000113b3a	nopw	(%rax,%rax)
