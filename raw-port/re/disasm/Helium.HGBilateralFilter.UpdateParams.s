__ZN17HGBilateralFilter12UpdateParamsEv:
00000000001c89d0	pushq	%rbp
00000000001c89d1	movq	%rsp, %rbp
00000000001c89d4	pushq	%r14
00000000001c89d6	pushq	%rbx
00000000001c89d7	subq	$0x10, %rsp
00000000001c89db	movq	%rdi, %rbx
00000000001c89de	movss	0x1a8(%rdi), %xmm0
00000000001c89e6	movss	0x1ac(%rdi), %xmm1
00000000001c89ee	movss	0x1b0(%rdi), %xmm2
00000000001c89f6	xorps	%xmm3, %xmm3
00000000001c89f9	ucomiss	%xmm3, %xmm2
00000000001c89fc	jbe	0x1c8a1b
00000000001c89fe	mulss	%xmm0, %xmm2
00000000001c8a02	cvtss2sd	%xmm2, %xmm2
00000000001c8a06	divsd	0x204342(%rip), %xmm2
00000000001c8a0e	roundsd	$0xa, %xmm2, %xmm2
00000000001c8a14	cvttsd2si	%xmm2, %r14d
00000000001c8a19	jmp	0x1c8a2d
00000000001c8a1b	roundss	$0xa, %xmm2, %xmm2
00000000001c8a21	xorps	0x2016a8(%rip), %xmm2
00000000001c8a28	cvttss2si	%xmm2, %r14d
00000000001c8a2d	cvtss2sd	%xmm1, %xmm1
00000000001c8a31	movsd	0x204707(%rip), %xmm2
00000000001c8a39	movaps	%xmm1, %xmm3
00000000001c8a3c	mulsd	%xmm2, %xmm3
00000000001c8a40	mulsd	%xmm1, %xmm3
00000000001c8a44	movsd	0x20430c(%rip), %xmm1
00000000001c8a4c	movapd	%xmm1, %xmm4
00000000001c8a50	divsd	%xmm3, %xmm4
00000000001c8a54	xorps	%xmm3, %xmm3
00000000001c8a57	cvtsd2ss	%xmm4, %xmm3
00000000001c8a5b	movss	%xmm3, -0x14(%rbp)
00000000001c8a60	cvtss2sd	%xmm0, %xmm0
00000000001c8a64	mulsd	%xmm0, %xmm2
00000000001c8a68	mulsd	%xmm0, %xmm2
00000000001c8a6c	divsd	%xmm2, %xmm1
00000000001c8a70	xorps	%xmm0, %xmm0
00000000001c8a73	cvtsd2ss	%xmm1, %xmm0
00000000001c8a77	movq	0x1a0(%rbx), %rdi
00000000001c8a7e	movq	(%rdi), %rax
00000000001c8a81	xorps	%xmm3, %xmm3
00000000001c8a84	xorl	%esi, %esi
00000000001c8a86	movaps	%xmm0, %xmm1
00000000001c8a89	movaps	%xmm0, %xmm2
00000000001c8a8c	callq	*0x60(%rax)
00000000001c8a8f	movq	0x1a0(%rbx), %rdi
00000000001c8a96	movq	(%rdi), %rax
00000000001c8a99	xorps	%xmm3, %xmm3
00000000001c8a9c	movl	$0x1, %esi
00000000001c8aa1	movss	-0x14(%rbp), %xmm0
00000000001c8aa6	movaps	%xmm0, %xmm1
00000000001c8aa9	movaps	%xmm0, %xmm2
00000000001c8aac	callq	*0x60(%rax)
00000000001c8aaf	movq	0x1a0(%rbx), %rdi
00000000001c8ab6	movl	%r14d, %esi
00000000001c8ab9	addq	$0x10, %rsp
00000000001c8abd	popq	%rbx
00000000001c8abe	popq	%r14
00000000001c8ac0	popq	%rbp
00000000001c8ac1	jmp	__ZN27HGBilateralFilterKernelNode13SetWindowSizeEi ## HGBilateralFilterKernelNode::SetWindowSize(int)
00000000001c8ac6	nopw	%cs:(%rax,%rax)
