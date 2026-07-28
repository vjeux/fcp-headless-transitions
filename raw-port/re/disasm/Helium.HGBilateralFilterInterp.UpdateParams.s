__ZN23HGBilateralFilterInterp12UpdateParamsEv:
0000000000109bb0	pushq	%rbp
0000000000109bb1	movq	%rsp, %rbp
0000000000109bb4	pushq	%r15
0000000000109bb6	pushq	%r14
0000000000109bb8	pushq	%rbx
0000000000109bb9	subq	$0x28, %rsp
0000000000109bbd	movq	%rdi, %rbx
0000000000109bc0	movl	0x1c8(%rdi), %r15d
0000000000109bc7	xorl	%r14d, %r14d
0000000000109bca	jmp	0x109c23
0000000000109bcc	nopl	(%rax)
0000000000109bd0	movss	-0x20(%rbp), %xmm4
0000000000109bd5	divss	-0x24(%rbp), %xmm4
0000000000109bda	addss	-0x1c(%rbp), %xmm4
0000000000109bdf	movq	(%rax,%r14,8), %rdi
0000000000109be3	movaps	%xmm4, %xmm1
0000000000109be6	movaps	-0x40(%rbp), %xmm0
0000000000109bea	addss	%xmm0, %xmm1
0000000000109bee	movss	0x2be0ca(%rip), %xmm2
0000000000109bf6	divss	%xmm4, %xmm2
0000000000109bfa	movaps	%xmm0, %xmm3
0000000000109bfd	xorps	0x2c04cc(%rip), %xmm3
0000000000109c04	divss	%xmm4, %xmm3
0000000000109c08	movq	(%rdi), %rax
0000000000109c0b	xorl	%esi, %esi
0000000000109c0d	callq	*0x60(%rax)
0000000000109c10	movl	0x1c8(%rbx), %r15d
0000000000109c17	incl	%r14d
0000000000109c1a	cmpl	%r15d, %r14d
0000000000109c1d	ja	0x109da3
0000000000109c23	movl	%r14d, %r14d
0000000000109c26	movq	0x1a8(%rbx), %rcx
0000000000109c2d	movq	(%rcx), %rax
0000000000109c30	movq	0x8(%rcx), %rcx
0000000000109c34	subq	%rax, %rcx
0000000000109c37	sarq	$0x3, %rcx
0000000000109c3b	cmpq	%r14, %rcx
0000000000109c3e	jbe	0x109d9e
0000000000109c44	movss	0x1d8(%rbx), %xmm0
0000000000109c4c	movss	%xmm0, -0x20(%rbp)
0000000000109c51	movss	0x1dc(%rbx), %xmm0
0000000000109c59	movss	%xmm0, -0x1c(%rbp)
0000000000109c5e	movq	(%rax,%r14,8), %rdi
0000000000109c62	movss	0x1cc(%rbx), %xmm0
0000000000109c6a	movq	(%rdi), %rax
0000000000109c6d	xorps	%xmm2, %xmm2
0000000000109c70	xorps	%xmm3, %xmm3
0000000000109c73	xorl	%esi, %esi
0000000000109c75	movaps	%xmm0, %xmm1
0000000000109c78	callq	*0x60(%rax)
0000000000109c7b	movq	0x198(%rbx), %rcx
0000000000109c82	movq	(%rcx), %rax
0000000000109c85	movq	0x8(%rcx), %rcx
0000000000109c89	subq	%rax, %rcx
0000000000109c8c	sarq	$0x3, %rcx
0000000000109c90	cmpq	%r14, %rcx
0000000000109c93	jbe	0x109d9e
0000000000109c99	movss	0x1d0(%rbx), %xmm0
0000000000109ca1	cvtss2sd	%xmm0, %xmm0
0000000000109ca5	movaps	%xmm0, %xmm1
0000000000109ca8	mulsd	0x2c3490(%rip), %xmm1
0000000000109cb0	mulsd	%xmm0, %xmm1
0000000000109cb4	movsd	0x2c309c(%rip), %xmm0
0000000000109cbc	divsd	%xmm1, %xmm0
0000000000109cc0	cvtsd2ss	%xmm0, %xmm0
0000000000109cc4	movq	(%rax,%r14,8), %rdi
0000000000109cc8	movq	(%rdi), %rax
0000000000109ccb	xorps	%xmm3, %xmm3
0000000000109cce	xorl	%esi, %esi
0000000000109cd0	movaps	%xmm0, %xmm1
0000000000109cd3	movaps	%xmm0, %xmm2
0000000000109cd6	callq	*0x60(%rax)
0000000000109cd9	movq	0x198(%rbx), %rcx
0000000000109ce0	movq	(%rcx), %rax
0000000000109ce3	movq	0x8(%rcx), %rcx
0000000000109ce7	subq	%rax, %rcx
0000000000109cea	sarq	$0x3, %rcx
0000000000109cee	cmpq	%r14, %rcx
0000000000109cf1	jbe	0x109d9e
0000000000109cf7	xorps	%xmm0, %xmm0
0000000000109cfa	cvtsi2ss	%r14, %xmm0
0000000000109cff	mulss	-0x20(%rbp), %xmm0
0000000000109d04	movl	%r15d, %ecx
0000000000109d07	xorps	%xmm1, %xmm1
0000000000109d0a	cvtsi2ss	%rcx, %xmm1
0000000000109d0f	movss	%xmm1, -0x24(%rbp)
0000000000109d14	divss	%xmm1, %xmm0
0000000000109d18	addss	-0x1c(%rbp), %xmm0
0000000000109d1d	movq	(%rax,%r14,8), %rdi
0000000000109d21	movq	(%rdi), %rax
0000000000109d24	movl	$0x1, %esi
0000000000109d29	movaps	%xmm0, %xmm1
0000000000109d2c	movaps	%xmm0, %xmm2
0000000000109d2f	movaps	%xmm0, -0x40(%rbp)
0000000000109d33	movaps	%xmm0, %xmm3
0000000000109d36	callq	*0x60(%rax)
0000000000109d39	movq	0x1a0(%rbx), %rcx
0000000000109d40	movq	(%rcx), %rax
0000000000109d43	movq	0x8(%rcx), %rcx
0000000000109d47	subq	%rax, %rcx
0000000000109d4a	sarq	$0x3, %rcx
0000000000109d4e	cmpq	%r14, %rcx
0000000000109d51	jbe	0x109d9e
0000000000109d53	movq	(%rax,%r14,8), %rdi
0000000000109d57	movss	0x1cc(%rbx), %xmm0
0000000000109d5f	movq	(%rdi), %rax
0000000000109d62	xorps	%xmm2, %xmm2
0000000000109d65	xorps	%xmm3, %xmm3
0000000000109d68	xorl	%esi, %esi
0000000000109d6a	movaps	%xmm0, %xmm1
0000000000109d6d	callq	*0x60(%rax)
0000000000109d70	movl	0x1c8(%rbx), %r15d
0000000000109d77	cmpl	%r15d, %r14d
0000000000109d7a	jae	0x109c17
0000000000109d80	movq	0x1b0(%rbx), %rcx
0000000000109d87	movq	(%rcx), %rax
0000000000109d8a	movq	0x8(%rcx), %rcx
0000000000109d8e	subq	%rax, %rcx
0000000000109d91	sarq	$0x3, %rcx
0000000000109d95	cmpq	%r14, %rcx
0000000000109d98	ja	0x109bd0
0000000000109d9e	callq	__ZNSt3__16vectorIP6HGNodeNS_9allocatorIS2_EEE20__throw_out_of_rangeB9nqe210106Ev ## std::__1::vector<HGNode*, std::__1::allocator<HGNode*>>::__throw_out_of_range[abi:nqe210106]()
0000000000109da3	addq	$0x28, %rsp
0000000000109da7	popq	%rbx
0000000000109da8	popq	%r14
0000000000109daa	popq	%r15
0000000000109dac	popq	%rbp
0000000000109dad	retq
0000000000109dae	nop
