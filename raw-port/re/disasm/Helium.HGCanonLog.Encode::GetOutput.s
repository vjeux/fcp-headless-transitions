__ZN10HGCanonLog6Encode9GetOutputEP10HGRenderer:
00000000001039f0	pushq	%rbp
00000000001039f1	movq	%rsp, %rbp
00000000001039f4	pushq	%r14
00000000001039f6	pushq	%rbx
00000000001039f7	subq	$0x20, %rsp
00000000001039fb	movq	%rdi, %rbx
00000000001039fe	movq	0x198(%rdi), %r14
0000000000103a05	movq	%rsi, %rdi
0000000000103a08	movq	%rbx, %rsi
0000000000103a0b	xorl	%edx, %edx
0000000000103a0d	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000103a12	movq	%rax, %rdx
0000000000103a15	testq	%r14, %r14
0000000000103a18	je	0x103a44
0000000000103a1a	movq	(%r14), %rax
0000000000103a1d	movq	%r14, %rdi
0000000000103a20	xorl	%esi, %esi
0000000000103a22	callq	*0x78(%rax)
0000000000103a25	movq	0x198(%rbx), %rdi
0000000000103a2c	movq	0x1a8(%rbx), %rsi
0000000000103a33	movl	$0x1, %edx
0000000000103a38	callq	__ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ## HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
0000000000103a3d	movq	0x198(%rbx), %rdx
0000000000103a44	movl	0x1b0(%rbx), %eax
0000000000103a4a	cmpl	$0x2, %eax
0000000000103a4d	je	0x103adb
0000000000103a53	cmpl	$0x1, %eax
0000000000103a56	je	0x103a9b
0000000000103a58	testl	%eax, %eax
0000000000103a5a	jne	0x103b4c
0000000000103a60	xorl	%eax, %eax
0000000000103a62	cmpl	$0x0, 0x1b4(%rbx)
0000000000103a69	sete	%al
0000000000103a6c	shll	$0x2, %eax
0000000000103a6f	leaq	0x2cd45a(%rip), %rcx
0000000000103a76	movss	(%rax,%rcx), %xmm0
0000000000103a7b	movss	%xmm0, -0x1c(%rbp)
0000000000103a80	leaq	0x2cd451(%rip), %rcx
0000000000103a87	movss	(%rax,%rcx), %xmm0
0000000000103a8c	movss	%xmm0, -0x14(%rbp)
0000000000103a91	movss	0x2cd573(%rip), %xmm0
0000000000103a99	jmp	0x103ad4
0000000000103a9b	xorl	%eax, %eax
0000000000103a9d	cmpl	$0x0, 0x1b4(%rbx)
0000000000103aa4	sete	%al
0000000000103aa7	shll	$0x2, %eax
0000000000103aaa	leaq	0x2cd40f(%rip), %rcx
0000000000103ab1	movss	(%rax,%rcx), %xmm0
0000000000103ab6	movss	%xmm0, -0x1c(%rbp)
0000000000103abb	leaq	0x2cd406(%rip), %rcx
0000000000103ac2	movss	(%rax,%rcx), %xmm0
0000000000103ac7	movss	%xmm0, -0x14(%rbp)
0000000000103acc	movss	0x2cd534(%rip), %xmm0
0000000000103ad4	movss	%xmm0, -0x18(%rbp)
0000000000103ad9	jmp	0x103b4c
0000000000103adb	xorl	%eax, %eax
0000000000103add	cmpl	$0x0, 0x1b4(%rbx)
0000000000103ae4	sete	%al
0000000000103ae7	shll	$0x2, %eax
0000000000103aea	leaq	0x2cd3a7(%rip), %rcx
0000000000103af1	movss	(%rax,%rcx), %xmm0
0000000000103af6	movss	%xmm0, -0x24(%rbp)
0000000000103afb	leaq	0x2cd39e(%rip), %rcx
0000000000103b02	movss	(%rax,%rcx), %xmm0
0000000000103b07	movss	%xmm0, -0x20(%rbp)
0000000000103b0c	leaq	0x2cd395(%rip), %rcx
0000000000103b13	movss	(%rax,%rcx), %xmm0
0000000000103b18	movss	%xmm0, -0x28(%rbp)
0000000000103b1d	leaq	0x2cd38c(%rip), %rcx
0000000000103b24	movss	(%rax,%rcx), %xmm0
0000000000103b29	movss	%xmm0, -0x1c(%rbp)
0000000000103b2e	leaq	0x2cd383(%rip), %rcx
0000000000103b35	movss	(%rax,%rcx), %xmm0
0000000000103b3a	movss	%xmm0, -0x14(%rbp)
0000000000103b3f	movss	0x2cd4bd(%rip), %xmm0
0000000000103b47	movss	%xmm0, -0x18(%rbp)
0000000000103b4c	movq	0x1a0(%rbx), %rdi
0000000000103b53	movq	(%rdi), %rax
0000000000103b56	xorl	%esi, %esi
0000000000103b58	callq	*0x78(%rax)
0000000000103b5b	cmpl	$0x2, 0x1b0(%rbx)
0000000000103b62	movq	0x1a0(%rbx), %rdi
0000000000103b69	jne	0x103b8a
0000000000103b6b	testq	%rdi, %rdi
0000000000103b6e	je	0x103bbe
0000000000103b70	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
0000000000103b77	leaq	__ZTI19HgcCanonLog3_encode(%rip), %rdx ## typeinfo for HgcCanonLog3_encode
0000000000103b7e	xorl	%ecx, %ecx
0000000000103b80	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000103b85	movq	%rax, %r14
0000000000103b88	jmp	0x103bc1
0000000000103b8a	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
0000000000103b91	leaq	__ZTI18HgcCanonLog_encode(%rip), %rdx ## typeinfo for HgcCanonLog_encode
0000000000103b98	xorl	%ecx, %ecx
0000000000103b9a	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000103b9f	movq	(%rax), %rcx
0000000000103ba2	xorps	%xmm3, %xmm3
0000000000103ba5	movq	%rax, %rdi
0000000000103ba8	xorl	%esi, %esi
0000000000103baa	movss	-0x14(%rbp), %xmm0
0000000000103baf	movss	-0x1c(%rbp), %xmm1
0000000000103bb4	movss	-0x18(%rbp), %xmm2
0000000000103bb9	callq	*0x60(%rcx)
0000000000103bbc	jmp	0x103c03
0000000000103bbe	xorl	%r14d, %r14d
0000000000103bc1	movq	(%r14), %rax
0000000000103bc4	movq	%r14, %rdi
0000000000103bc7	xorl	%esi, %esi
0000000000103bc9	movss	-0x14(%rbp), %xmm0
0000000000103bce	movss	-0x24(%rbp), %xmm1
0000000000103bd3	movss	-0x20(%rbp), %xmm2
0000000000103bd8	movss	-0x18(%rbp), %xmm3
0000000000103bdd	callq	*0x60(%rax)
0000000000103be0	movq	(%r14), %rax
0000000000103be3	movss	0x2cd425(%rip), %xmm2
0000000000103beb	xorps	%xmm3, %xmm3
0000000000103bee	movq	%r14, %rdi
0000000000103bf1	movl	$0x1, %esi
0000000000103bf6	movss	-0x28(%rbp), %xmm0
0000000000103bfb	movss	-0x1c(%rbp), %xmm1
0000000000103c00	callq	*0x60(%rax)
0000000000103c03	movq	0x1a0(%rbx), %rax
0000000000103c0a	addq	$0x20, %rsp
0000000000103c0e	popq	%rbx
0000000000103c0f	popq	%r14
0000000000103c11	popq	%rbp
0000000000103c12	retq
0000000000103c13	nopw	%cs:(%rax,%rax)
