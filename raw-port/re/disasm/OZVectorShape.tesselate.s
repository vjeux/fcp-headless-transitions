__ZN13OZVectorShape9tesselateEv:
00000000003038c0	pushq	%rbp
00000000003038c1	movq	%rsp, %rbp
00000000003038c4	pushq	%r15
00000000003038c6	pushq	%r14
00000000003038c8	pushq	%r13
00000000003038ca	pushq	%r12
00000000003038cc	pushq	%rbx
00000000003038cd	subq	$0x218, %rsp                    ## imm = 0x218
00000000003038d4	movq	0x522b5d(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000003038db	movq	(%rax), %rax
00000000003038de	movq	%rax, -0x30(%rbp)
00000000003038e2	cmpb	$0x0, 0x78(%rdi)
00000000003038e6	jne	0x3099ed
00000000003038ec	movq	0x60(%rdi), %rsi
00000000003038f0	movq	0x68(%rdi), %r8
00000000003038f4	cmpq	%r8, %rsi
00000000003038f7	je	0x3099ed
00000000003038fd	xorl	%eax, %eax
00000000003038ff	movq	%rsi, %rcx
0000000000303902	nopw	%cs:(%rax,%rax)
0000000000303910	movq	(%rcx), %rdx
0000000000303913	addl	0x10(%rdx), %eax
0000000000303916	addq	$0x8, %rcx
000000000030391a	cmpq	%r8, %rcx
000000000030391d	jne	0x303910
000000000030391f	testl	%eax, %eax
0000000000303921	je	0x3099ed
0000000000303927	movq	%r8, -0x78(%rbp)
000000000030392b	movq	%rsi, -0x70(%rbp)
000000000030392f	movq	%rdi, -0x58(%rbp)
0000000000303933	xorps	%xmm0, %xmm0
0000000000303936	movaps	%xmm0, -0x140(%rbp)
000000000030393d	movq	$0x0, -0x130(%rbp)
0000000000303948	movl	$0x18, %edi
000000000030394d	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000303952	movq	%rax, %r14
0000000000303955	movq	%rax, %rdi
0000000000303958	callq	__ZN15OZQuadraticPathC1Ev       ## OZQuadraticPath::OZQuadraticPath()
000000000030395d	movabsq	$0x1fffffffffffffff, %rdx       ## imm = 0x1FFFFFFFFFFFFFFF
0000000000303967	movq	-0x138(%rbp), %r12
000000000030396e	movq	-0x130(%rbp), %rax
0000000000303975	cmpq	%rax, %r12
0000000000303978	jae	0x30398a
000000000030397a	movq	%r14, (%r12)
000000000030397e	addq	$0x8, %r12
0000000000303982	movq	%r12, %r15
0000000000303985	jmp	0x303a40
000000000030398a	movq	-0x140(%rbp), %rsi
0000000000303991	subq	%rsi, %r12
0000000000303994	movq	%r12, %rbx
0000000000303997	sarq	$0x3, %rbx
000000000030399b	leaq	0x1(%rbx), %rcx
000000000030399f	cmpq	%rdx, %rcx
00000000003039a2	ja	0x309aac
00000000003039a8	subq	%rsi, %rax
00000000003039ab	movq	%rax, %r15
00000000003039ae	sarq	$0x2, %r15
00000000003039b2	cmpq	%rcx, %r15
00000000003039b5	cmovbeq	%rcx, %r15
00000000003039b9	movabsq	$0x7ffffffffffffff8, %rcx       ## imm = 0x7FFFFFFFFFFFFFF8
00000000003039c3	cmpq	%rcx, %rax
00000000003039c6	cmovaeq	%rdx, %r15
00000000003039ca	cmpq	%rdx, %r15
00000000003039cd	ja	0x309ab3
00000000003039d3	movq	%rsi, -0xa0(%rbp)
00000000003039da	leaq	(,%r15,8), %rdi
00000000003039e2	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003039e7	leaq	(%rax,%r12), %r13
00000000003039eb	leaq	(%rax,%r15,8), %rcx
00000000003039ef	movq	%rcx, -0x90(%rbp)
00000000003039f6	movq	%r14, (%rax,%r12)
00000000003039fa	leaq	(%rax,%r12), %r15
00000000003039fe	addq	$0x8, %r15
0000000000303a02	shlq	$0x3, %rbx
0000000000303a06	subq	%rbx, %r13
0000000000303a09	movq	%r13, %rdi
0000000000303a0c	movq	-0xa0(%rbp), %rbx
0000000000303a13	movq	%rbx, %rsi
0000000000303a16	movq	%r12, %rdx
0000000000303a19	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000303a1e	movq	%r13, -0x140(%rbp)
0000000000303a25	movq	-0x90(%rbp), %rax
0000000000303a2c	movq	%rax, -0x130(%rbp)
0000000000303a33	testq	%rbx, %rbx
0000000000303a36	je	0x303a40
0000000000303a38	movq	%rbx, %rdi
0000000000303a3b	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000303a40	movq	-0x70(%rbp), %rax
0000000000303a44	movq	%r15, -0x138(%rbp)
0000000000303a4b	jmp	0x303a62
0000000000303a4d	nopl	(%rax)
0000000000303a50	movq	-0x70(%rbp), %rax
0000000000303a54	addq	$0x8, %rax
0000000000303a58	cmpq	-0x78(%rbp), %rax
0000000000303a5c	je	0x303b91
0000000000303a62	movq	%rax, -0x70(%rbp)
0000000000303a66	movq	(%rax), %r15
0000000000303a69	movq	0x8(%r15), %rbx
0000000000303a6d	cmpq	%r15, %rbx
0000000000303a70	jne	0x303a94
0000000000303a72	jmp	0x303a50
0000000000303a74	movq	%r12, %rdi
0000000000303a77	movq	%r14, %rsi
0000000000303a7a	leaq	-0x140(%rbp), %rdx
0000000000303a81	movl	$0x5, %ecx
0000000000303a86	callq	__ZL19fixTriangleOverlapsR18OZQuadraticSegmentR15OZQuadraticPathRNSt3__16vectorIPS1_NS3_9allocatorIS5_EEEEi ## fixTriangleOverlaps(OZQuadraticSegment&, OZQuadraticPath&, std::__1::vector<OZQuadraticPath*, std::__1::allocator<OZQuadraticPath*>>&, int)
0000000000303a8b	movq	0x8(%rbx), %rbx
0000000000303a8f	cmpq	%r15, %rbx
0000000000303a92	je	0x303a50
0000000000303a94	movq	0x10(%rbx), %r12
0000000000303a98	movl	(%r12), %eax
0000000000303a9c	testl	%eax, %eax
0000000000303a9e	je	0x303b30
0000000000303aa4	cmpl	$0x1, %eax
0000000000303aa7	jne	0x303a8b
0000000000303aa9	movsd	0x4(%r12), %xmm0
0000000000303ab0	movsd	0xc(%r12), %xmm1
0000000000303ab7	movsd	0x14(%r12), %xmm2
0000000000303abe	subps	%xmm0, %xmm1
0000000000303ac1	shufps	$0xe1, %xmm1, %xmm1             ## xmm1 = xmm1[1,0,2,3]
0000000000303ac5	subps	%xmm0, %xmm2
0000000000303ac8	mulps	%xmm1, %xmm2
0000000000303acb	movshdup	%xmm2, %xmm0                    ## xmm0 = xmm2[1,1,3,3]
0000000000303acf	subss	%xmm0, %xmm2
0000000000303ad3	andps	0x4040e6(%rip), %xmm2
0000000000303ada	xorps	%xmm0, %xmm0
0000000000303add	cvtss2sd	%xmm2, %xmm0
0000000000303ae1	ucomisd	0x40406f(%rip), %xmm0
0000000000303ae9	ja	0x303a74
0000000000303aeb	movl	$0x14, %edi
0000000000303af0	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000303af5	movq	%rax, %r13
0000000000303af8	movl	$0x0, (%rax)
0000000000303afe	movsd	0x4(%r12), %xmm0
0000000000303b05	movsd	%xmm0, 0x4(%rax)
0000000000303b0a	movsd	0xc(%r12), %xmm0
0000000000303b11	movsd	%xmm0, 0xc(%rax)
0000000000303b16	movl	$0x18, %edi
0000000000303b1b	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000303b20	jmp	0x303b66
0000000000303b22	nopw	%cs:(%rax,%rax)
0000000000303b30	movl	$0x14, %edi
0000000000303b35	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000303b3a	movq	%rax, %r13
0000000000303b3d	xorps	%xmm0, %xmm0
0000000000303b40	movups	%xmm0, (%rax)
0000000000303b43	movl	$0x0, 0x10(%rax)
0000000000303b4a	movq	0x4(%r12), %rax
0000000000303b4f	movq	%rax, 0x4(%r13)
0000000000303b53	movq	0xc(%r12), %rax
0000000000303b58	movq	%rax, 0xc(%r13)
0000000000303b5c	movl	$0x18, %edi
0000000000303b61	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000303b66	movq	%r13, 0x10(%rax)
0000000000303b6a	movq	%r14, 0x8(%rax)
0000000000303b6e	movq	(%r14), %rcx
0000000000303b71	movq	%rcx, (%rax)
0000000000303b74	movq	%rax, 0x8(%rcx)
0000000000303b78	movq	%rax, (%r14)
0000000000303b7b	incq	0x10(%r14)
0000000000303b7f	movq	0x8(%rbx), %rbx
0000000000303b83	cmpq	%r15, %rbx
0000000000303b86	jne	0x303a94
0000000000303b8c	jmp	0x303a50
0000000000303b91	movq	-0x140(%rbp), %rcx
0000000000303b98	movq	-0x138(%rbp), %rdx
0000000000303b9f	movabsq	$0x3ff0000000000000, %rbx       ## imm = 0x3FF0000000000000
0000000000303ba9	movq	%rcx, %rax
0000000000303bac	movq	%rdx, -0x158(%rbp)
0000000000303bb3	cmpq	%rdx, %rcx
0000000000303bb6	je	0x3060d4
0000000000303bbc	leaq	-0x208(%rbp), %r12
0000000000303bc3	movq	-0x58(%rbp), %r14
0000000000303bc7	leaq	0xc0(%r14), %rcx
0000000000303bce	movq	%rcx, -0x160(%rbp)
0000000000303bd5	movaps	0x4079c4(%rip), %xmm0
0000000000303bdc	movaps	%xmm0, -0x90(%rbp)
0000000000303be3	movaps	0x4079c6(%rip), %xmm3
0000000000303bea	movb	$0x1, %cl
0000000000303bec	movl	%ecx, -0x118(%rbp)
0000000000303bf2	movq	$0x0, -0x78(%rbp)
0000000000303bfa	xorps	%xmm0, %xmm0
0000000000303bfd	movaps	%xmm0, -0x150(%rbp)
0000000000303c04	movaps	%xmm0, -0x180(%rbp)
0000000000303c0b	jmp	0x303c28
0000000000303c0d	nopl	(%rax)
0000000000303c10	movq	-0xc0(%rbp), %rax
0000000000303c17	addq	$0x8, %rax
0000000000303c1b	cmpq	-0x158(%rbp), %rax
0000000000303c22	je	0x3060bf
0000000000303c28	movq	%rax, -0xc0(%rbp)
0000000000303c2f	movq	(%rax), %rcx
0000000000303c32	movq	0x8(%rcx), %r13
0000000000303c36	cmpq	%rcx, %r13
0000000000303c39	je	0x303c10
0000000000303c3b	movq	%rcx, -0xb8(%rbp)
0000000000303c42	jmp	0x303d2c
0000000000303c47	movq	%r13, %r15
0000000000303c4a	movl	%ebx, %eax
0000000000303c4c	leaq	(,%rbx,4), %rcx
0000000000303c54	leaq	(%rcx,%rcx,4), %r14
0000000000303c58	leaq	(%r15,%r14), %rdi
0000000000303c5c	addq	$0x14, %rdi
0000000000303c60	addq	%r14, %r15
0000000000303c63	subl	%ebx, %eax
0000000000303c65	shlq	$0x2, %rax
0000000000303c69	leaq	(%rax,%rax,4), %rdx
0000000000303c6d	movq	%r15, %rsi
0000000000303c70	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000303c75	movq	-0x58(%rbp), %rax
0000000000303c79	movq	0xe8(%rax), %rax
0000000000303c80	movl	$0x0, (%rax,%r14)
0000000000303c88	movaps	-0xb0(%rbp), %xmm0
0000000000303c8f	movups	%xmm0, 0x4(%rax,%r14)
0000000000303c95	movq	-0x58(%rbp), %r14
0000000000303c99	incl	0xe0(%r14)
0000000000303ca0	movq	-0x70(%rbp), %rax
0000000000303ca4	movsd	0x4(%rax), %xmm2
0000000000303ca9	movaps	%xmm2, %xmm1
0000000000303cac	insertps	$0x10, 0x8(%rax), %xmm1         ## xmm1 = xmm1[0],mem[0],xmm1[2,3]
0000000000303cb3	movsd	0xc(%rax), %xmm3
0000000000303cb8	movaps	%xmm3, %xmm4
0000000000303cbb	insertps	$0x10, 0x10(%rax), %xmm4        ## xmm4 = xmm4[0],mem[0],xmm4[2,3]
0000000000303cc2	movaps	%xmm4, %xmm0
0000000000303cc5	cmpltps	%xmm1, %xmm0
0000000000303cc9	movaps	%xmm2, %xmm5
0000000000303ccc	blendvps	%xmm0, %xmm3, %xmm5
0000000000303cd1	minps	-0x90(%rbp), %xmm5
0000000000303cd8	cmpltps	%xmm4, %xmm1
0000000000303cdc	movaps	%xmm1, %xmm0
0000000000303cdf	blendvps	%xmm0, %xmm3, %xmm2
0000000000303ce4	maxps	-0xa0(%rbp), %xmm2
0000000000303ceb	movq	-0x78(%rbp), %rax
0000000000303cef	addl	$0x2, %eax
0000000000303cf2	movq	%rax, -0x78(%rbp)
0000000000303cf6	movaps	%xmm2, %xmm3
0000000000303cf9	movaps	%xmm5, -0x90(%rbp)
0000000000303d00	movabsq	$0x3ff0000000000000, %rbx       ## imm = 0x3FF0000000000000
0000000000303d0a	leaq	-0x208(%rbp), %r12
0000000000303d11	movq	-0xb8(%rbp), %rcx
0000000000303d18	movq	-0x100(%rbp), %r13
0000000000303d1f	movq	0x8(%r13), %r13
0000000000303d23	cmpq	%rcx, %r13
0000000000303d26	je	0x303c10
0000000000303d2c	movq	0x10(%r13), %rdx
0000000000303d30	movl	(%rdx), %eax
0000000000303d32	cmpl	$0x1, %eax
0000000000303d35	je	0x303e10
0000000000303d3b	testl	%eax, %eax
0000000000303d3d	jne	0x303d1f
0000000000303d3f	movsd	0x4(%rdx), %xmm0
0000000000303d44	movsd	0xc(%rdx), %xmm1
0000000000303d49	subps	%xmm1, %xmm0
0000000000303d4c	andps	0x403e6d(%rip), %xmm0
0000000000303d53	cmpltps	0x4047e5(%rip), %xmm0
0000000000303d5b	unpcklps	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,1,1]
0000000000303d5e	movmskpd	%xmm0, %eax
0000000000303d62	cmpl	$0x3, %eax
0000000000303d65	je	0x303d1f
0000000000303d67	movq	%rdx, -0x70(%rbp)
0000000000303d6b	movq	%r13, -0x100(%rbp)
0000000000303d72	movaps	%xmm3, -0xa0(%rbp)
0000000000303d79	movl	0x90(%r14), %ebx
0000000000303d80	movq	0x98(%r14), %r15
0000000000303d87	cmpl	0x94(%r14), %ebx
0000000000303d8e	jne	0x303e50
0000000000303d94	movq	%r14, %rax
0000000000303d97	leal	(%rbx,%rbx), %r14d
0000000000303d9b	movl	%r14d, 0x94(%rax)
0000000000303da2	leaq	(,%r14,8), %r12
0000000000303daa	movq	%r12, %rdi
0000000000303dad	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000303db2	movq	%rax, %r13
0000000000303db5	testl	%r14d, %r14d
0000000000303db8	je	0x303dc5
0000000000303dba	movq	%r13, %rdi
0000000000303dbd	movq	%r12, %rsi
0000000000303dc0	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000303dc5	movq	-0x58(%rbp), %r14
0000000000303dc9	movq	%r13, 0x98(%r14)
0000000000303dd0	leaq	(,%rbx,8), %rdx
0000000000303dd8	movq	%r13, %rdi
0000000000303ddb	movq	%r15, %rsi
0000000000303dde	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000303de3	movl	%ebx, %edx
0000000000303de5	testq	%r15, %r15
0000000000303de8	je	0x303e55
0000000000303dea	movq	%r15, %rdi
0000000000303ded	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000303df2	movl	0x90(%r14), %edx
0000000000303df9	movq	0x98(%r14), %r13
0000000000303e00	jmp	0x303e55
0000000000303e02	nopw	%cs:(%rax,%rax)
0000000000303e10	cmpb	$0x1, 0x1c(%rdx)
0000000000303e14	jne	0x303d1f
0000000000303e1a	movaps	%xmm3, -0xa0(%rbp)
0000000000303e21	movq	%rdx, -0x70(%rbp)
0000000000303e25	leaq	0x14(%rdx), %r15
0000000000303e29	movq	%r14, %rdi
0000000000303e2c	movq	%r15, %rsi
0000000000303e2f	callq	__ZN13OZVectorShape11isOnOutlineERK9PCVector2IfE ## OZVectorShape::isOnOutline(PCVector2<float> const&)
0000000000303e34	movb	%al, -0xe0(%rbp)
0000000000303e3a	testb	%al, %al
0000000000303e3c	movq	%r15, -0xb0(%rbp)
0000000000303e43	je	0x303f22
0000000000303e49	xorl	%eax, %eax
0000000000303e4b	jmp	0x303f2d
0000000000303e50	movq	%r15, %r13
0000000000303e53	movl	%ebx, %edx
0000000000303e55	leaq	(,%rbx,8), %rsi
0000000000303e5d	addq	%r13, %rsi
0000000000303e60	leaq	0x8(,%rbx,8), %rdi
0000000000303e68	addq	%r13, %rdi
0000000000303e6b	subl	%ebx, %edx
0000000000303e6d	shlq	$0x3, %rdx
0000000000303e71	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000303e76	movq	0x98(%r14), %rax
0000000000303e7d	movq	-0x70(%rbp), %rcx
0000000000303e81	movq	0x4(%rcx), %rcx
0000000000303e85	movq	%rcx, (%rax,%rbx,8)
0000000000303e89	movl	0x90(%r14), %ebx
0000000000303e90	incl	%ebx
0000000000303e92	movl	%ebx, 0x90(%r14)
0000000000303e99	movq	0x98(%r14), %r15
0000000000303ea0	cmpl	0x94(%r14), %ebx
0000000000303ea7	jne	0x304085
0000000000303ead	movq	%r14, %rax
0000000000303eb0	leal	(%rbx,%rbx), %r14d
0000000000303eb4	movl	%r14d, 0x94(%rax)
0000000000303ebb	leaq	(,%r14,8), %r12
0000000000303ec3	movq	%r12, %rdi
0000000000303ec6	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000303ecb	movq	%rax, %r13
0000000000303ece	testl	%r14d, %r14d
0000000000303ed1	je	0x303ede
0000000000303ed3	movq	%r13, %rdi
0000000000303ed6	movq	%r12, %rsi
0000000000303ed9	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000303ede	movq	-0x58(%rbp), %r14
0000000000303ee2	movq	%r13, 0x98(%r14)
0000000000303ee9	leaq	(,%rbx,8), %rdx
0000000000303ef1	movq	%r13, %rdi
0000000000303ef4	movq	%r15, %rsi
0000000000303ef7	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000303efc	movl	%ebx, %edx
0000000000303efe	testq	%r15, %r15
0000000000303f01	je	0x30408a
0000000000303f07	movq	%r15, %rdi
0000000000303f0a	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000303f0f	movl	0x90(%r14), %edx
0000000000303f16	movq	0x98(%r14), %r13
0000000000303f1d	jmp	0x30408a
0000000000303f22	movq	%r14, %rdi
0000000000303f25	movq	%r15, %rsi
0000000000303f28	callq	__ZN13OZVectorShape15isInteriorPointERK9PCVector2IfE ## OZVectorShape::isInteriorPoint(PCVector2<float> const&)
0000000000303f2d	movq	-0x70(%rbp), %rcx
0000000000303f31	movsd	0x4(%rcx), %xmm1
0000000000303f36	movsd	0xc(%rcx), %xmm2
0000000000303f3b	movsd	0x14(%rcx), %xmm0
0000000000303f40	subps	%xmm1, %xmm2
0000000000303f43	shufps	$0xe1, %xmm2, %xmm2             ## xmm2 = xmm2[1,0,2,3]
0000000000303f47	movaps	%xmm0, %xmm3
0000000000303f4a	subps	%xmm1, %xmm3
0000000000303f4d	mulps	%xmm2, %xmm3
0000000000303f50	movshdup	%xmm3, %xmm1                    ## xmm1 = xmm3[1,1,3,3]
0000000000303f54	subss	%xmm1, %xmm3
0000000000303f58	andps	0x403c61(%rip), %xmm3
0000000000303f5f	xorps	%xmm1, %xmm1
0000000000303f62	cvtss2sd	%xmm3, %xmm1
0000000000303f66	ucomisd	0x403bea(%rip), %xmm1
0000000000303f6e	movq	%r13, -0x100(%rbp)
0000000000303f75	jbe	0x303ff5
0000000000303f77	testb	$0x1, -0x118(%rbp)
0000000000303f7e	jne	0x304517
0000000000303f84	movaps	-0x150(%rbp), %xmm1
0000000000303f8b	movaps	-0x180(%rbp), %xmm2
0000000000303f92	subps	%xmm2, %xmm1
0000000000303f95	subps	%xmm2, %xmm0
0000000000303f98	movaps	%xmm1, %xmm2
0000000000303f9b	shufps	$0xe1, %xmm1, %xmm2             ## xmm2 = xmm2[1,0],xmm1[2,3]
0000000000303f9f	mulps	%xmm0, %xmm2
0000000000303fa2	movshdup	%xmm2, %xmm3                    ## xmm3 = xmm2[1,1,3,3]
0000000000303fa6	subss	%xmm3, %xmm2
0000000000303faa	andps	0x403c0f(%rip), %xmm2
0000000000303fb1	cvtss2sd	%xmm2, %xmm2
0000000000303fb5	ucomisd	0x403b9b(%rip), %xmm2
0000000000303fbd	ja	0x304517
0000000000303fc3	mulps	%xmm1, %xmm0
0000000000303fc6	movshdup	%xmm0, %xmm2                    ## xmm2 = xmm0[1,1,3,3]
0000000000303fca	addps	%xmm0, %xmm2
0000000000303fcd	xorps	%xmm0, %xmm0
0000000000303fd0	ucomiss	%xmm2, %xmm0
0000000000303fd3	ja	0x304517
0000000000303fd9	mulps	%xmm1, %xmm1
0000000000303fdc	movshdup	%xmm1, %xmm0                    ## xmm0 = xmm1[1,1,3,3]
0000000000303fe0	addss	%xmm1, %xmm0
0000000000303fe4	ucomiss	%xmm0, %xmm2
0000000000303fe7	setbe	%cl
0000000000303fea	andb	%al, %cl
0000000000303fec	cmpb	$0x1, %cl
0000000000303fef	jne	0x304517
0000000000303ff5	movl	0x90(%r14), %ebx
0000000000303ffc	movq	0x98(%r14), %r15
0000000000304003	cmpl	0x94(%r14), %ebx
000000000030400a	jne	0x30479d
0000000000304010	movq	%r14, %rax
0000000000304013	leal	(%rbx,%rbx), %r14d
0000000000304017	movl	%r14d, 0x94(%rax)
000000000030401e	leaq	(,%r14,8), %r12
0000000000304026	movq	%r12, %rdi
0000000000304029	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030402e	movq	%rax, %r13
0000000000304031	testl	%r14d, %r14d
0000000000304034	je	0x304041
0000000000304036	movq	%r13, %rdi
0000000000304039	movq	%r12, %rsi
000000000030403c	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000304041	movq	-0x58(%rbp), %r14
0000000000304045	movq	%r13, 0x98(%r14)
000000000030404c	leaq	(,%rbx,8), %rdx
0000000000304054	movq	%r13, %rdi
0000000000304057	movq	%r15, %rsi
000000000030405a	callq	0x6dff8a                        ## symbol stub for: _memcpy
000000000030405f	movl	%ebx, %edx
0000000000304061	testq	%r15, %r15
0000000000304064	je	0x3047a2
000000000030406a	movq	%r15, %rdi
000000000030406d	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000304072	movl	0x90(%r14), %edx
0000000000304079	movq	0x98(%r14), %r13
0000000000304080	jmp	0x3047a2
0000000000304085	movq	%r15, %r13
0000000000304088	movl	%ebx, %edx
000000000030408a	leaq	(,%rbx,8), %rsi
0000000000304092	addq	%r13, %rsi
0000000000304095	leaq	0x8(,%rbx,8), %rdi
000000000030409d	addq	%r13, %rdi
00000000003040a0	subl	%ebx, %edx
00000000003040a2	shlq	$0x3, %rdx
00000000003040a6	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003040ab	movq	0x98(%r14), %rax
00000000003040b2	movq	-0x70(%rbp), %rcx
00000000003040b6	movq	0xc(%rcx), %rcx
00000000003040ba	movq	%rcx, (%rax,%rbx,8)
00000000003040be	incl	0x90(%r14)
00000000003040c5	movl	0x80(%r14), %ebx
00000000003040cc	movq	0x88(%r14), %r15
00000000003040d3	cmpl	0x84(%r14), %ebx
00000000003040da	jne	0x30412b
00000000003040dc	leal	(%rbx,%rbx), %edi
00000000003040df	movl	%edi, 0x84(%r14)
00000000003040e6	shlq	$0x2, %rdi
00000000003040ea	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003040ef	movq	%rax, %r12
00000000003040f2	movq	%rax, 0x88(%r14)
00000000003040f9	leaq	(,%rbx,4), %rdx
0000000000304101	movq	%rax, %rdi
0000000000304104	movq	%r15, %rsi
0000000000304107	callq	0x6dff8a                        ## symbol stub for: _memcpy
000000000030410c	movl	%ebx, %edx
000000000030410e	testq	%r15, %r15
0000000000304111	je	0x304130
0000000000304113	movq	%r15, %rdi
0000000000304116	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030411b	movl	0x80(%r14), %edx
0000000000304122	movq	0x88(%r14), %r12
0000000000304129	jmp	0x304130
000000000030412b	movq	%r15, %r12
000000000030412e	movl	%ebx, %edx
0000000000304130	leaq	(%r12,%rbx,4), %rsi
0000000000304134	leaq	(%r12,%rbx,4), %rdi
0000000000304138	addq	$0x4, %rdi
000000000030413c	subl	%ebx, %edx
000000000030413e	shlq	$0x2, %rdx
0000000000304142	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000304147	movq	-0x70(%rbp), %rax
000000000030414b	movss	0x4(%rax), %xmm0
0000000000304150	movq	0x88(%r14), %r15
0000000000304157	movss	%xmm0, (%r15,%rbx,4)
000000000030415d	movl	0x80(%r14), %ebx
0000000000304164	incl	%ebx
0000000000304166	movl	%ebx, 0x80(%r14)
000000000030416d	cmpl	0x84(%r14), %ebx
0000000000304174	jne	0x3041bb
0000000000304176	leal	(%rbx,%rbx), %edi
0000000000304179	movl	%edi, 0x84(%r14)
0000000000304180	shlq	$0x2, %rdi
0000000000304184	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304189	movq	%rax, 0x88(%r14)
0000000000304190	leaq	(,%rbx,4), %rdx
0000000000304198	movq	%rax, %rdi
000000000030419b	movq	%r15, %rsi
000000000030419e	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003041a3	movq	%r15, %rdi
00000000003041a6	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003041ab	movl	0x80(%r14), %edx
00000000003041b2	movq	0x88(%r14), %r15
00000000003041b9	jmp	0x3041bd
00000000003041bb	movl	%ebx, %edx
00000000003041bd	leaq	(%r15,%rbx,4), %rsi
00000000003041c1	leaq	(%r15,%rbx,4), %rdi
00000000003041c5	addq	$0x4, %rdi
00000000003041c9	subl	%ebx, %edx
00000000003041cb	shlq	$0x2, %rdx
00000000003041cf	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003041d4	movq	-0x70(%rbp), %rax
00000000003041d8	movss	0x8(%rax), %xmm0
00000000003041dd	movq	0x88(%r14), %r15
00000000003041e4	movss	%xmm0, (%r15,%rbx,4)
00000000003041ea	movl	0x80(%r14), %ebx
00000000003041f1	incl	%ebx
00000000003041f3	movl	%ebx, 0x80(%r14)
00000000003041fa	cmpl	0x84(%r14), %ebx
0000000000304201	jne	0x304248
0000000000304203	leal	(%rbx,%rbx), %edi
0000000000304206	movl	%edi, 0x84(%r14)
000000000030420d	shlq	$0x2, %rdi
0000000000304211	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304216	movq	%rax, 0x88(%r14)
000000000030421d	leaq	(,%rbx,4), %rdx
0000000000304225	movq	%rax, %rdi
0000000000304228	movq	%r15, %rsi
000000000030422b	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000304230	movq	%r15, %rdi
0000000000304233	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000304238	movl	0x80(%r14), %edx
000000000030423f	movq	0x88(%r14), %r15
0000000000304246	jmp	0x30424a
0000000000304248	movl	%ebx, %edx
000000000030424a	leaq	(%r15,%rbx,4), %rsi
000000000030424e	leaq	(%r15,%rbx,4), %rdi
0000000000304252	addq	$0x4, %rdi
0000000000304256	subl	%ebx, %edx
0000000000304258	shlq	$0x2, %rdx
000000000030425c	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000304261	movq	-0x70(%rbp), %rax
0000000000304265	movss	0xc(%rax), %xmm0
000000000030426a	movq	0x88(%r14), %r15
0000000000304271	movss	%xmm0, (%r15,%rbx,4)
0000000000304277	movl	0x80(%r14), %ebx
000000000030427e	incl	%ebx
0000000000304280	movl	%ebx, 0x80(%r14)
0000000000304287	cmpl	0x84(%r14), %ebx
000000000030428e	jne	0x3042d5
0000000000304290	leal	(%rbx,%rbx), %edi
0000000000304293	movl	%edi, 0x84(%r14)
000000000030429a	shlq	$0x2, %rdi
000000000030429e	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003042a3	movq	%rax, 0x88(%r14)
00000000003042aa	leaq	(,%rbx,4), %rdx
00000000003042b2	movq	%rax, %rdi
00000000003042b5	movq	%r15, %rsi
00000000003042b8	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003042bd	movq	%r15, %rdi
00000000003042c0	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003042c5	movl	0x80(%r14), %edx
00000000003042cc	movq	0x88(%r14), %r15
00000000003042d3	jmp	0x3042d7
00000000003042d5	movl	%ebx, %edx
00000000003042d7	leaq	(%r15,%rbx,4), %rsi
00000000003042db	leaq	(%r15,%rbx,4), %rdi
00000000003042df	addq	$0x4, %rdi
00000000003042e3	subl	%ebx, %edx
00000000003042e5	shlq	$0x2, %rdx
00000000003042e9	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003042ee	movq	-0x70(%rbp), %rax
00000000003042f2	movss	0x10(%rax), %xmm0
00000000003042f7	movq	0x88(%r14), %rax
00000000003042fe	movss	%xmm0, (%rax,%rbx,4)
0000000000304303	incl	0x80(%r14)
000000000030430a	movl	0xa0(%r14), %ebx
0000000000304311	movq	0xa8(%r14), %r15
0000000000304318	cmpl	0xa4(%r14), %ebx
000000000030431f	jne	0x304370
0000000000304321	leal	(%rbx,%rbx), %edi
0000000000304324	movl	%edi, 0xa4(%r14)
000000000030432b	shlq	$0x3, %rdi
000000000030432f	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304334	movq	%rax, %r12
0000000000304337	movq	%rax, 0xa8(%r14)
000000000030433e	leaq	(,%rbx,8), %rdx
0000000000304346	movq	%rax, %rdi
0000000000304349	movq	%r15, %rsi
000000000030434c	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000304351	movl	%ebx, %edx
0000000000304353	testq	%r15, %r15
0000000000304356	je	0x304375
0000000000304358	movq	%r15, %rdi
000000000030435b	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000304360	movl	0xa0(%r14), %edx
0000000000304367	movq	0xa8(%r14), %r12
000000000030436e	jmp	0x304375
0000000000304370	movq	%r15, %r12
0000000000304373	movl	%ebx, %edx
0000000000304375	movq	-0x78(%rbp), %r15
0000000000304379	leal	0x1(%r15), %r14d
000000000030437d	leaq	(%r12,%rbx,8), %rsi
0000000000304381	leaq	(%r12,%rbx,8), %rdi
0000000000304385	addq	$0x8, %rdi
0000000000304389	subl	%ebx, %edx
000000000030438b	shlq	$0x3, %rdx
000000000030438f	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000304394	movq	-0x58(%rbp), %rax
0000000000304398	movq	0xa8(%rax), %rax
000000000030439f	shlq	$0x20, %r14
00000000003043a3	movl	%r15d, %ecx
00000000003043a6	orq	%r14, %rcx
00000000003043a9	movq	-0x58(%rbp), %rdx
00000000003043ad	movq	%rcx, (%rax,%rbx,8)
00000000003043b1	incl	0xa0(%rdx)
00000000003043b7	movq	-0x70(%rbp), %rax
00000000003043bb	movups	0x4(%rax), %xmm0
00000000003043bf	movaps	%xmm0, -0xb0(%rbp)
00000000003043c6	movl	0xd0(%rdx), %ebx
00000000003043cc	movq	0xd8(%rdx), %r13
00000000003043d3	cmpl	0xd4(%rdx), %ebx
00000000003043d9	jne	0x304473
00000000003043df	leal	(%rbx,%rbx), %r12d
00000000003043e3	movl	%r12d, 0xd4(%rdx)
00000000003043ea	leaq	(,%r12,4), %rax
00000000003043f2	leaq	(%rax,%rax,4), %r14
00000000003043f6	movq	%r14, %rdi
00000000003043f9	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003043fe	movq	%rax, %r15
0000000000304401	testl	%r12d, %r12d
0000000000304404	je	0x304432
0000000000304406	addq	$-0x14, %r14
000000000030440a	movq	%r14, %rax
000000000030440d	movabsq	$-0x3333333333333333, %rcx      ## imm = 0xCCCCCCCCCCCCCCCD
0000000000304417	mulq	%rcx
000000000030441a	shrq	$0x4, %rdx
000000000030441e	leaq	(%rdx,%rdx,4), %rax
0000000000304422	leaq	0x14(,%rax,4), %rsi
000000000030442a	movq	%r15, %rdi
000000000030442d	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000304432	movq	-0x58(%rbp), %r14
0000000000304436	movq	%r15, 0xd8(%r14)
000000000030443d	leaq	(,%rbx,4), %rax
0000000000304445	leaq	(%rax,%rax,4), %rdx
0000000000304449	movq	%r15, %rdi
000000000030444c	movq	%r13, %rsi
000000000030444f	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000304454	movl	%ebx, %eax
0000000000304456	testq	%r13, %r13
0000000000304459	je	0x304478
000000000030445b	movq	%r13, %rdi
000000000030445e	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000304463	movl	0xd0(%r14), %eax
000000000030446a	movq	0xd8(%r14), %r15
0000000000304471	jmp	0x304478
0000000000304473	movq	%r13, %r15
0000000000304476	movl	%ebx, %eax
0000000000304478	leaq	(,%rbx,4), %rcx
0000000000304480	leaq	(%rcx,%rcx,4), %r14
0000000000304484	leaq	(%r15,%r14), %rdi
0000000000304488	addq	$0x14, %rdi
000000000030448c	addq	%r14, %r15
000000000030448f	subl	%ebx, %eax
0000000000304491	shlq	$0x2, %rax
0000000000304495	leaq	(%rax,%rax,4), %rdx
0000000000304499	movq	%r15, %rsi
000000000030449c	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003044a1	movq	-0x58(%rbp), %rax
00000000003044a5	movq	0xd8(%rax), %rax
00000000003044ac	movl	$0x0, (%rax,%r14)
00000000003044b4	movaps	-0xb0(%rbp), %xmm0
00000000003044bb	movups	%xmm0, 0x4(%rax,%r14)
00000000003044c1	movq	-0x58(%rbp), %rax
00000000003044c5	incl	0xd0(%rax)
00000000003044cb	movq	-0x70(%rbp), %rcx
00000000003044cf	movups	0x4(%rcx), %xmm0
00000000003044d3	movaps	%xmm0, -0xb0(%rbp)
00000000003044da	movl	0xe0(%rax), %ebx
00000000003044e0	movq	0xe8(%rax), %r13
00000000003044e7	cmpl	0xe4(%rax), %ebx
00000000003044ed	jne	0x303c47
00000000003044f3	leal	(%rbx,%rbx), %r12d
00000000003044f7	movl	%r12d, 0xe4(%rax)
00000000003044fe	leaq	(,%r12,4), %rax
0000000000304506	leaq	(%rax,%rax,4), %r14
000000000030450a	movq	%r14, %rdi
000000000030450d	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304512	jmp	0x304cf1
0000000000304517	xorpd	%xmm12, %xmm12
000000000030451c	movapd	%xmm12, -0x230(%rbp)
0000000000304525	movq	$0x0, -0x220(%rbp)
0000000000304530	movl	$0x3, -0x214(%rbp)
000000000030453a	movq	%rbx, -0x198(%rbp)
0000000000304541	movq	%rbx, -0x1c0(%rbp)
0000000000304548	movq	%rbx, -0x1e8(%rbp)
000000000030454f	movq	%rbx, -0x210(%rbp)
0000000000304556	movupd	%xmm12, 0x10(%r12)
000000000030455d	movupd	%xmm12, (%r12)
0000000000304563	movupd	%xmm12, 0x38(%r12)
000000000030456a	movupd	%xmm12, 0x28(%r12)
0000000000304571	movupd	%xmm12, 0x60(%r12)
0000000000304578	movupd	%xmm12, 0x50(%r12)
000000000030457f	movl	__ZN10PTTriangle9idCounterE(%rip), %ecx ## PTTriangle::idCounter
0000000000304585	incl	%ecx
0000000000304587	movl	%ecx, __ZN10PTTriangle9idCounterE(%rip) ## PTTriangle::idCounter
000000000030458d	movl	%ecx, -0x190(%rbp)
0000000000304593	movl	$0x0, -0x18c(%rbp)
000000000030459d	movq	-0x70(%rbp), %rdi
00000000003045a1	movq	0x4(%rdi), %rsi
00000000003045a5	movq	0x14(%rdi), %rcx
00000000003045a9	movq	%rcx, %rdx
00000000003045ac	shrq	$0x20, %rdx
00000000003045b0	movd	%edx, %xmm2
00000000003045b4	pinsrd	$0x1, %ecx, %xmm2
00000000003045ba	movq	%rsi, -0x230(%rbp)
00000000003045c1	movq	%rcx, -0x228(%rbp)
00000000003045c8	movq	0xc(%rdi), %rdi
00000000003045cc	movq	%rdi, -0x220(%rbp)
00000000003045d3	movq	%rsi, %xmm0
00000000003045d8	movq	%rdi, %xmm8
00000000003045dd	pshufd	$0xe1, %xmm8, %xmm1             ## xmm1 = xmm8[1,0,2,3]
00000000003045e3	movdqa	%xmm2, %xmm3
00000000003045e7	subps	%xmm1, %xmm3
00000000003045ea	mulps	%xmm0, %xmm3
00000000003045ed	movdqa	%xmm2, %xmm1
00000000003045f1	mulps	%xmm8, %xmm1
00000000003045f5	movshdup	%xmm3, %xmm4                    ## xmm4 = xmm3[1,1,3,3]
00000000003045f9	subss	%xmm4, %xmm3
00000000003045fd	movshdup	%xmm1, %xmm5                    ## xmm5 = xmm1[1,1,3,3]
0000000000304601	addss	%xmm3, %xmm5
0000000000304605	subss	%xmm1, %xmm5
0000000000304609	movaps	%xmm5, %xmm1
000000000030460c	andps	0x4035ad(%rip), %xmm1
0000000000304613	movss	0x4035c5(%rip), %xmm3
000000000030461b	ucomiss	%xmm1, %xmm3
000000000030461e	ja	0x304d6d
0000000000304624	movss	0x402924(%rip), %xmm4
000000000030462c	movaps	%xmm0, %xmm1
000000000030462f	addps	%xmm8, %xmm1
0000000000304633	movshdup	%xmm1, %xmm3                    ## xmm3 = xmm1[1,1,3,3]
0000000000304637	cvtss2sd	%xmm3, %xmm3
000000000030463b	divss	%xmm5, %xmm4
000000000030463f	movsd	0x402860(%rip), %xmm10
0000000000304648	mulsd	%xmm10, %xmm3
000000000030464d	cvtps2pd	%xmm2, %xmm6
0000000000304650	xorps	%xmm5, %xmm5
0000000000304653	cvtss2sd	%xmm4, %xmm5
0000000000304657	cvtss2sd	%xmm1, %xmm7
000000000030465b	cvtps2pd	%xmm0, %xmm9
000000000030465f	cvtps2pd	%xmm8, %xmm8
0000000000304663	mulsd	%xmm10, %xmm7
0000000000304668	shufpd	$0x1, %xmm8, %xmm8              ## xmm8 = xmm8[1,0]
000000000030466e	mulpd	0x400d89(%rip), %xmm8
0000000000304677	movapd	%xmm6, %xmm10
000000000030467c	subpd	%xmm8, %xmm10
0000000000304681	mulpd	%xmm9, %xmm10
0000000000304686	movapd	%xmm10, %xmm8
000000000030468b	unpckhpd	%xmm10, %xmm8                   ## xmm8 = xmm8[1],xmm10[1]
0000000000304690	subsd	%xmm8, %xmm10
0000000000304695	mulsd	%xmm5, %xmm10
000000000030469a	xorps	%xmm8, %xmm8
000000000030469e	cvtsd2ss	%xmm10, %xmm8
00000000003046a3	movshdup	%xmm0, %xmm9                    ## xmm9 = xmm0[1,1,3,3]
00000000003046a8	movd	%edx, %xmm10
00000000003046ad	movaps	%xmm9, %xmm11
00000000003046b1	subss	%xmm10, %xmm11
00000000003046b6	mulss	%xmm4, %xmm11
00000000003046bb	insertps	$0x10, %xmm11, %xmm8            ## xmm8 = xmm8[0],xmm11[0],xmm8[2,3]
00000000003046c2	movd	%ecx, %xmm10
00000000003046c7	mulss	%xmm10, %xmm9
00000000003046cc	subss	%xmm0, %xmm10
00000000003046d1	mulss	%xmm4, %xmm10
00000000003046d6	mulss	%xmm2, %xmm0
00000000003046da	subss	%xmm9, %xmm0
00000000003046df	mulss	%xmm4, %xmm0
00000000003046e3	blendpd	$0x2, %xmm6, %xmm3              ## xmm3 = xmm3[0],xmm6[1]
00000000003046e9	unpcklpd	%xmm7, %xmm6                    ## xmm6 = xmm6[0],xmm7[0]
00000000003046ed	subpd	%xmm6, %xmm3
00000000003046f1	movddup	%xmm5, %xmm2                    ## xmm2 = xmm5[0,0]
00000000003046f5	mulpd	%xmm3, %xmm2
00000000003046f9	cvtpd2ps	%xmm2, %xmm2
00000000003046fd	cvtps2pd	%xmm2, %xmm2
0000000000304700	movaps	%xmm2, -0x210(%rbp)
0000000000304707	movq	$0x0, -0x200(%rbp)
0000000000304712	cvtps2pd	%xmm8, %xmm2
0000000000304716	xorps	%xmm3, %xmm3
0000000000304719	cvtss2sd	%xmm10, %xmm3
000000000030471e	movups	%xmm2, -0x1f8(%rbp)
0000000000304725	movsd	%xmm3, -0x1e8(%rbp)
000000000030472d	cvtss2sd	%xmm0, %xmm0
0000000000304731	movq	$0x0, -0x1e0(%rbp)
000000000030473c	movsd	%xmm0, -0x1d8(%rbp)
0000000000304744	movupd	%xmm12, 0x58(%r12)
000000000030474b	movupd	%xmm12, 0x48(%r12)
0000000000304752	movupd	%xmm12, 0x38(%r12)
0000000000304759	movq	$0x0, 0x68(%r12)
0000000000304762	movq	%rbx, -0x198(%rbp)
0000000000304769	cmpb	$0x0, -0xe0(%rbp)
0000000000304770	je	0x304dfd
0000000000304776	mulps	0x402683(%rip), %xmm1
000000000030477d	movlps	%xmm1, -0x50(%rbp)
0000000000304781	movq	%r14, %rdi
0000000000304784	leaq	-0x50(%rbp), %rsi
0000000000304788	callq	__ZN13OZVectorShape15isInteriorPointERK9PCVector2IfE ## OZVectorShape::isInteriorPoint(PCVector2<float> const&)
000000000030478d	movzbl	%al, %eax
0000000000304790	incl	%eax
0000000000304792	movl	%eax, -0x218(%rbp)
0000000000304798	jmp	0x304e0d
000000000030479d	movq	%r15, %r13
00000000003047a0	movl	%ebx, %edx
00000000003047a2	leaq	(,%rbx,8), %rsi
00000000003047aa	addq	%r13, %rsi
00000000003047ad	leaq	0x8(,%rbx,8), %rdi
00000000003047b5	addq	%r13, %rdi
00000000003047b8	subl	%ebx, %edx
00000000003047ba	shlq	$0x3, %rdx
00000000003047be	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003047c3	movq	0x98(%r14), %rax
00000000003047ca	movq	-0x70(%rbp), %rcx
00000000003047ce	movq	0x4(%rcx), %rcx
00000000003047d2	movq	%rcx, (%rax,%rbx,8)
00000000003047d6	movl	0x90(%r14), %ebx
00000000003047dd	incl	%ebx
00000000003047df	movl	%ebx, 0x90(%r14)
00000000003047e6	movq	0x98(%r14), %r15
00000000003047ed	cmpl	0x94(%r14), %ebx
00000000003047f4	jne	0x304864
00000000003047f6	movq	%r14, %rax
00000000003047f9	leal	(%rbx,%rbx), %r14d
00000000003047fd	movl	%r14d, 0x94(%rax)
0000000000304804	leaq	(,%r14,8), %r12
000000000030480c	movq	%r12, %rdi
000000000030480f	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304814	movq	%rax, %r13
0000000000304817	testl	%r14d, %r14d
000000000030481a	je	0x304827
000000000030481c	movq	%r13, %rdi
000000000030481f	movq	%r12, %rsi
0000000000304822	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000304827	movq	-0x58(%rbp), %r14
000000000030482b	movq	%r13, 0x98(%r14)
0000000000304832	leaq	(,%rbx,8), %rdx
000000000030483a	movq	%r13, %rdi
000000000030483d	movq	%r15, %rsi
0000000000304840	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000304845	movl	%ebx, %edx
0000000000304847	testq	%r15, %r15
000000000030484a	je	0x304869
000000000030484c	movq	%r15, %rdi
000000000030484f	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000304854	movl	0x90(%r14), %edx
000000000030485b	movq	0x98(%r14), %r13
0000000000304862	jmp	0x304869
0000000000304864	movq	%r15, %r13
0000000000304867	movl	%ebx, %edx
0000000000304869	leaq	(,%rbx,8), %rsi
0000000000304871	addq	%r13, %rsi
0000000000304874	leaq	0x8(,%rbx,8), %rdi
000000000030487c	addq	%r13, %rdi
000000000030487f	subl	%ebx, %edx
0000000000304881	shlq	$0x3, %rdx
0000000000304885	callq	0x6dff90                        ## symbol stub for: _memmove
000000000030488a	movq	0x98(%r14), %rax
0000000000304891	movq	-0x70(%rbp), %rcx
0000000000304895	movq	0xc(%rcx), %rcx
0000000000304899	movq	%rcx, (%rax,%rbx,8)
000000000030489d	incl	0x90(%r14)
00000000003048a4	movl	0x80(%r14), %ebx
00000000003048ab	movq	0x88(%r14), %r15
00000000003048b2	cmpl	0x84(%r14), %ebx
00000000003048b9	jne	0x30490a
00000000003048bb	leal	(%rbx,%rbx), %edi
00000000003048be	movl	%edi, 0x84(%r14)
00000000003048c5	shlq	$0x2, %rdi
00000000003048c9	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003048ce	movq	%rax, %r12
00000000003048d1	movq	%rax, 0x88(%r14)
00000000003048d8	leaq	(,%rbx,4), %rdx
00000000003048e0	movq	%rax, %rdi
00000000003048e3	movq	%r15, %rsi
00000000003048e6	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003048eb	movl	%ebx, %edx
00000000003048ed	testq	%r15, %r15
00000000003048f0	je	0x30490f
00000000003048f2	movq	%r15, %rdi
00000000003048f5	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003048fa	movl	0x80(%r14), %edx
0000000000304901	movq	0x88(%r14), %r12
0000000000304908	jmp	0x30490f
000000000030490a	movq	%r15, %r12
000000000030490d	movl	%ebx, %edx
000000000030490f	leaq	(%r12,%rbx,4), %rsi
0000000000304913	leaq	(%r12,%rbx,4), %rdi
0000000000304917	addq	$0x4, %rdi
000000000030491b	subl	%ebx, %edx
000000000030491d	shlq	$0x2, %rdx
0000000000304921	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000304926	movq	-0x70(%rbp), %rax
000000000030492a	movss	0x4(%rax), %xmm0
000000000030492f	movq	0x88(%r14), %r15
0000000000304936	movss	%xmm0, (%r15,%rbx,4)
000000000030493c	movl	0x80(%r14), %ebx
0000000000304943	incl	%ebx
0000000000304945	movl	%ebx, 0x80(%r14)
000000000030494c	cmpl	0x84(%r14), %ebx
0000000000304953	jne	0x30499a
0000000000304955	leal	(%rbx,%rbx), %edi
0000000000304958	movl	%edi, 0x84(%r14)
000000000030495f	shlq	$0x2, %rdi
0000000000304963	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304968	movq	%rax, 0x88(%r14)
000000000030496f	leaq	(,%rbx,4), %rdx
0000000000304977	movq	%rax, %rdi
000000000030497a	movq	%r15, %rsi
000000000030497d	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000304982	movq	%r15, %rdi
0000000000304985	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030498a	movl	0x80(%r14), %edx
0000000000304991	movq	0x88(%r14), %r15
0000000000304998	jmp	0x30499c
000000000030499a	movl	%ebx, %edx
000000000030499c	leaq	(%r15,%rbx,4), %rsi
00000000003049a0	leaq	(%r15,%rbx,4), %rdi
00000000003049a4	addq	$0x4, %rdi
00000000003049a8	subl	%ebx, %edx
00000000003049aa	shlq	$0x2, %rdx
00000000003049ae	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003049b3	movq	-0x70(%rbp), %rax
00000000003049b7	movss	0x8(%rax), %xmm0
00000000003049bc	movq	0x88(%r14), %r15
00000000003049c3	movss	%xmm0, (%r15,%rbx,4)
00000000003049c9	movl	0x80(%r14), %ebx
00000000003049d0	incl	%ebx
00000000003049d2	movl	%ebx, 0x80(%r14)
00000000003049d9	cmpl	0x84(%r14), %ebx
00000000003049e0	jne	0x304a27
00000000003049e2	leal	(%rbx,%rbx), %edi
00000000003049e5	movl	%edi, 0x84(%r14)
00000000003049ec	shlq	$0x2, %rdi
00000000003049f0	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003049f5	movq	%rax, 0x88(%r14)
00000000003049fc	leaq	(,%rbx,4), %rdx
0000000000304a04	movq	%rax, %rdi
0000000000304a07	movq	%r15, %rsi
0000000000304a0a	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000304a0f	movq	%r15, %rdi
0000000000304a12	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000304a17	movl	0x80(%r14), %edx
0000000000304a1e	movq	0x88(%r14), %r15
0000000000304a25	jmp	0x304a29
0000000000304a27	movl	%ebx, %edx
0000000000304a29	leaq	(%r15,%rbx,4), %rsi
0000000000304a2d	leaq	(%r15,%rbx,4), %rdi
0000000000304a31	addq	$0x4, %rdi
0000000000304a35	subl	%ebx, %edx
0000000000304a37	shlq	$0x2, %rdx
0000000000304a3b	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000304a40	movq	-0x70(%rbp), %rax
0000000000304a44	movss	0xc(%rax), %xmm0
0000000000304a49	movq	0x88(%r14), %r15
0000000000304a50	movss	%xmm0, (%r15,%rbx,4)
0000000000304a56	movl	0x80(%r14), %ebx
0000000000304a5d	incl	%ebx
0000000000304a5f	movl	%ebx, 0x80(%r14)
0000000000304a66	cmpl	0x84(%r14), %ebx
0000000000304a6d	jne	0x304ab4
0000000000304a6f	leal	(%rbx,%rbx), %edi
0000000000304a72	movl	%edi, 0x84(%r14)
0000000000304a79	shlq	$0x2, %rdi
0000000000304a7d	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304a82	movq	%rax, 0x88(%r14)
0000000000304a89	leaq	(,%rbx,4), %rdx
0000000000304a91	movq	%rax, %rdi
0000000000304a94	movq	%r15, %rsi
0000000000304a97	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000304a9c	movq	%r15, %rdi
0000000000304a9f	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000304aa4	movl	0x80(%r14), %edx
0000000000304aab	movq	0x88(%r14), %r15
0000000000304ab2	jmp	0x304ab6
0000000000304ab4	movl	%ebx, %edx
0000000000304ab6	leaq	(%r15,%rbx,4), %rsi
0000000000304aba	leaq	(%r15,%rbx,4), %rdi
0000000000304abe	addq	$0x4, %rdi
0000000000304ac2	subl	%ebx, %edx
0000000000304ac4	shlq	$0x2, %rdx
0000000000304ac8	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000304acd	movq	-0x70(%rbp), %rax
0000000000304ad1	movss	0x10(%rax), %xmm0
0000000000304ad6	movq	0x88(%r14), %rax
0000000000304add	movss	%xmm0, (%rax,%rbx,4)
0000000000304ae2	incl	0x80(%r14)
0000000000304ae9	movl	0xa0(%r14), %ebx
0000000000304af0	movq	0xa8(%r14), %r15
0000000000304af7	cmpl	0xa4(%r14), %ebx
0000000000304afe	jne	0x304b4f
0000000000304b00	leal	(%rbx,%rbx), %edi
0000000000304b03	movl	%edi, 0xa4(%r14)
0000000000304b0a	shlq	$0x3, %rdi
0000000000304b0e	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304b13	movq	%rax, %r12
0000000000304b16	movq	%rax, 0xa8(%r14)
0000000000304b1d	leaq	(,%rbx,8), %rdx
0000000000304b25	movq	%rax, %rdi
0000000000304b28	movq	%r15, %rsi
0000000000304b2b	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000304b30	movl	%ebx, %edx
0000000000304b32	testq	%r15, %r15
0000000000304b35	je	0x304b54
0000000000304b37	movq	%r15, %rdi
0000000000304b3a	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000304b3f	movl	0xa0(%r14), %edx
0000000000304b46	movq	0xa8(%r14), %r12
0000000000304b4d	jmp	0x304b54
0000000000304b4f	movq	%r15, %r12
0000000000304b52	movl	%ebx, %edx
0000000000304b54	movq	-0x78(%rbp), %r15
0000000000304b58	leal	0x1(%r15), %r14d
0000000000304b5c	leaq	(%r12,%rbx,8), %rsi
0000000000304b60	leaq	(%r12,%rbx,8), %rdi
0000000000304b64	addq	$0x8, %rdi
0000000000304b68	subl	%ebx, %edx
0000000000304b6a	shlq	$0x3, %rdx
0000000000304b6e	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000304b73	movq	-0x58(%rbp), %rax
0000000000304b77	movq	0xa8(%rax), %rax
0000000000304b7e	shlq	$0x20, %r14
0000000000304b82	movl	%r15d, %ecx
0000000000304b85	orq	%r14, %rcx
0000000000304b88	movq	-0x58(%rbp), %rdx
0000000000304b8c	movq	%rcx, (%rax,%rbx,8)
0000000000304b90	incl	0xa0(%rdx)
0000000000304b96	movq	-0x70(%rbp), %rax
0000000000304b9a	movups	0x4(%rax), %xmm0
0000000000304b9e	movaps	%xmm0, -0xb0(%rbp)
0000000000304ba5	movl	0xd0(%rdx), %ebx
0000000000304bab	movq	0xd8(%rdx), %r13
0000000000304bb2	cmpl	0xd4(%rdx), %ebx
0000000000304bb8	jne	0x304c52
0000000000304bbe	leal	(%rbx,%rbx), %r12d
0000000000304bc2	movl	%r12d, 0xd4(%rdx)
0000000000304bc9	leaq	(,%r12,4), %rax
0000000000304bd1	leaq	(%rax,%rax,4), %r14
0000000000304bd5	movq	%r14, %rdi
0000000000304bd8	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304bdd	movq	%rax, %r15
0000000000304be0	testl	%r12d, %r12d
0000000000304be3	je	0x304c11
0000000000304be5	addq	$-0x14, %r14
0000000000304be9	movq	%r14, %rax
0000000000304bec	movabsq	$-0x3333333333333333, %rcx      ## imm = 0xCCCCCCCCCCCCCCCD
0000000000304bf6	mulq	%rcx
0000000000304bf9	shrq	$0x4, %rdx
0000000000304bfd	leaq	(%rdx,%rdx,4), %rax
0000000000304c01	leaq	0x14(,%rax,4), %rsi
0000000000304c09	movq	%r15, %rdi
0000000000304c0c	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000304c11	movq	-0x58(%rbp), %r14
0000000000304c15	movq	%r15, 0xd8(%r14)
0000000000304c1c	leaq	(,%rbx,4), %rax
0000000000304c24	leaq	(%rax,%rax,4), %rdx
0000000000304c28	movq	%r15, %rdi
0000000000304c2b	movq	%r13, %rsi
0000000000304c2e	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000304c33	movl	%ebx, %eax
0000000000304c35	testq	%r13, %r13
0000000000304c38	je	0x304c57
0000000000304c3a	movq	%r13, %rdi
0000000000304c3d	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000304c42	movl	0xd0(%r14), %eax
0000000000304c49	movq	0xd8(%r14), %r15
0000000000304c50	jmp	0x304c57
0000000000304c52	movq	%r13, %r15
0000000000304c55	movl	%ebx, %eax
0000000000304c57	leaq	(,%rbx,4), %rcx
0000000000304c5f	leaq	(%rcx,%rcx,4), %r14
0000000000304c63	leaq	(%r15,%r14), %rdi
0000000000304c67	addq	$0x14, %rdi
0000000000304c6b	addq	%r14, %r15
0000000000304c6e	subl	%ebx, %eax
0000000000304c70	shlq	$0x2, %rax
0000000000304c74	leaq	(%rax,%rax,4), %rdx
0000000000304c78	movq	%r15, %rsi
0000000000304c7b	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000304c80	movq	-0x58(%rbp), %rax
0000000000304c84	movq	0xd8(%rax), %rax
0000000000304c8b	movl	$0x0, (%rax,%r14)
0000000000304c93	movaps	-0xb0(%rbp), %xmm0
0000000000304c9a	movups	%xmm0, 0x4(%rax,%r14)
0000000000304ca0	movq	-0x58(%rbp), %rax
0000000000304ca4	incl	0xd0(%rax)
0000000000304caa	movq	-0x70(%rbp), %rcx
0000000000304cae	movups	0x4(%rcx), %xmm0
0000000000304cb2	movaps	%xmm0, -0xb0(%rbp)
0000000000304cb9	movl	0xe0(%rax), %ebx
0000000000304cbf	movq	0xe8(%rax), %r13
0000000000304cc6	cmpl	0xe4(%rax), %ebx
0000000000304ccc	jne	0x303c47
0000000000304cd2	leal	(%rbx,%rbx), %r12d
0000000000304cd6	movl	%r12d, 0xe4(%rax)
0000000000304cdd	leaq	(,%r12,4), %rax
0000000000304ce5	leaq	(%rax,%rax,4), %r14
0000000000304ce9	movq	%r14, %rdi
0000000000304cec	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304cf1	movq	%rax, %r15
0000000000304cf4	testl	%r12d, %r12d
0000000000304cf7	je	0x304d25
0000000000304cf9	addq	$-0x14, %r14
0000000000304cfd	movq	%r14, %rax
0000000000304d00	movabsq	$-0x3333333333333333, %rcx      ## imm = 0xCCCCCCCCCCCCCCCD
0000000000304d0a	mulq	%rcx
0000000000304d0d	shrq	$0x4, %rdx
0000000000304d11	leaq	(%rdx,%rdx,4), %rax
0000000000304d15	leaq	0x14(,%rax,4), %rsi
0000000000304d1d	movq	%r15, %rdi
0000000000304d20	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000304d25	movq	-0x58(%rbp), %r14
0000000000304d29	movq	%r15, 0xe8(%r14)
0000000000304d30	leaq	(,%rbx,4), %rax
0000000000304d38	leaq	(%rax,%rax,4), %rdx
0000000000304d3c	movq	%r15, %rdi
0000000000304d3f	movq	%r13, %rsi
0000000000304d42	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000304d47	movl	%ebx, %eax
0000000000304d49	testq	%r13, %r13
0000000000304d4c	je	0x303c4c
0000000000304d52	movq	%r13, %rdi
0000000000304d55	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000304d5a	movl	0xe0(%r14), %eax
0000000000304d61	movq	0xe8(%r14), %r15
0000000000304d68	jmp	0x303c4c
0000000000304d6d	movl	0x90(%r14), %ebx
0000000000304d74	movq	0x98(%r14), %r15
0000000000304d7b	cmpl	0x94(%r14), %ebx
0000000000304d82	jne	0x304eb3
0000000000304d88	movq	%r14, %rax
0000000000304d8b	leal	(%rbx,%rbx), %r14d
0000000000304d8f	movl	%r14d, 0x94(%rax)
0000000000304d96	leaq	(,%r14,8), %r12
0000000000304d9e	movq	%r12, %rdi
0000000000304da1	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304da6	movq	%rax, %r13
0000000000304da9	testl	%r14d, %r14d
0000000000304dac	je	0x304db9
0000000000304dae	movq	%r13, %rdi
0000000000304db1	movq	%r12, %rsi
0000000000304db4	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000304db9	movq	-0x58(%rbp), %r14
0000000000304dbd	movq	%r13, 0x98(%r14)
0000000000304dc4	leaq	(,%rbx,8), %rdx
0000000000304dcc	movq	%r13, %rdi
0000000000304dcf	movq	%r15, %rsi
0000000000304dd2	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000304dd7	movl	%ebx, %edx
0000000000304dd9	testq	%r15, %r15
0000000000304ddc	je	0x304eb8
0000000000304de2	movq	%r15, %rdi
0000000000304de5	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000304dea	movl	0x90(%r14), %edx
0000000000304df1	movq	0x98(%r14), %r13
0000000000304df8	jmp	0x304eb8
0000000000304dfd	movzbl	%al, %eax
0000000000304e00	movl	$0x2, %ecx
0000000000304e05	subl	%eax, %ecx
0000000000304e07	movl	%ecx, -0x218(%rbp)
0000000000304e0d	movq	-0x160(%rbp), %rdi
0000000000304e14	movl	(%rdi), %esi
0000000000304e16	leaq	-0x230(%rbp), %rdx
0000000000304e1d	callq	__ZN14PCDynamicArrayI10PTTriangleE6insertEjRKS0_ ## PCDynamicArray<PTTriangle>::insert(unsigned int, PTTriangle const&)
0000000000304e22	movq	-0x58(%rbp), %r14
0000000000304e26	movl	0x90(%r14), %ebx
0000000000304e2d	movq	0x98(%r14), %r12
0000000000304e34	cmpl	0x94(%r14), %ebx
0000000000304e3b	jne	0x305144
0000000000304e41	leal	(%rbx,%rbx), %r13d
0000000000304e45	movl	%r13d, 0x94(%r14)
0000000000304e4c	leaq	(,%r13,8), %r14
0000000000304e54	movq	%r14, %rdi
0000000000304e57	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304e5c	movq	%rax, %r15
0000000000304e5f	testl	%r13d, %r13d
0000000000304e62	je	0x304e6f
0000000000304e64	movq	%r15, %rdi
0000000000304e67	movq	%r14, %rsi
0000000000304e6a	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000304e6f	movq	-0x58(%rbp), %r14
0000000000304e73	movq	%r15, 0x98(%r14)
0000000000304e7a	leaq	(,%rbx,8), %rdx
0000000000304e82	movq	%r15, %rdi
0000000000304e85	movq	%r12, %rsi
0000000000304e88	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000304e8d	movl	%ebx, %edx
0000000000304e8f	testq	%r12, %r12
0000000000304e92	je	0x305149
0000000000304e98	movq	%r12, %rdi
0000000000304e9b	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000304ea0	movl	0x90(%r14), %edx
0000000000304ea7	movq	0x98(%r14), %r15
0000000000304eae	jmp	0x305149
0000000000304eb3	movq	%r15, %r13
0000000000304eb6	movl	%ebx, %edx
0000000000304eb8	leaq	(,%rbx,8), %rsi
0000000000304ec0	addq	%r13, %rsi
0000000000304ec3	leaq	0x8(,%rbx,8), %rdi
0000000000304ecb	addq	%r13, %rdi
0000000000304ece	subl	%ebx, %edx
0000000000304ed0	shlq	$0x3, %rdx
0000000000304ed4	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000304ed9	movq	0x98(%r14), %rax
0000000000304ee0	movq	-0x70(%rbp), %rcx
0000000000304ee4	movq	0x4(%rcx), %rcx
0000000000304ee8	movq	%rcx, (%rax,%rbx,8)
0000000000304eec	movl	0x90(%r14), %ebx
0000000000304ef3	incl	%ebx
0000000000304ef5	movl	%ebx, 0x90(%r14)
0000000000304efc	movq	0x98(%r14), %r15
0000000000304f03	cmpl	0x94(%r14), %ebx
0000000000304f0a	jne	0x304f7a
0000000000304f0c	movq	%r14, %rax
0000000000304f0f	leal	(%rbx,%rbx), %r14d
0000000000304f13	movl	%r14d, 0x94(%rax)
0000000000304f1a	leaq	(,%r14,8), %r12
0000000000304f22	movq	%r12, %rdi
0000000000304f25	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304f2a	movq	%rax, %r13
0000000000304f2d	testl	%r14d, %r14d
0000000000304f30	je	0x304f3d
0000000000304f32	movq	%r13, %rdi
0000000000304f35	movq	%r12, %rsi
0000000000304f38	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000304f3d	movq	-0x58(%rbp), %r14
0000000000304f41	movq	%r13, 0x98(%r14)
0000000000304f48	leaq	(,%rbx,8), %rdx
0000000000304f50	movq	%r13, %rdi
0000000000304f53	movq	%r15, %rsi
0000000000304f56	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000304f5b	movl	%ebx, %edx
0000000000304f5d	testq	%r15, %r15
0000000000304f60	je	0x304f7f
0000000000304f62	movq	%r15, %rdi
0000000000304f65	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000304f6a	movl	0x90(%r14), %edx
0000000000304f71	movq	0x98(%r14), %r13
0000000000304f78	jmp	0x304f7f
0000000000304f7a	movq	%r15, %r13
0000000000304f7d	movl	%ebx, %edx
0000000000304f7f	leaq	(,%rbx,8), %rsi
0000000000304f87	addq	%r13, %rsi
0000000000304f8a	leaq	0x8(,%rbx,8), %rdi
0000000000304f92	addq	%r13, %rdi
0000000000304f95	subl	%ebx, %edx
0000000000304f97	shlq	$0x3, %rdx
0000000000304f9b	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000304fa0	movq	0x98(%r14), %rax
0000000000304fa7	movq	-0x70(%rbp), %rcx
0000000000304fab	movq	0xc(%rcx), %rcx
0000000000304faf	movq	%rcx, (%rax,%rbx,8)
0000000000304fb3	incl	0x90(%r14)
0000000000304fba	movl	0x80(%r14), %ebx
0000000000304fc1	movq	0x88(%r14), %r15
0000000000304fc8	cmpl	0x84(%r14), %ebx
0000000000304fcf	jne	0x305020
0000000000304fd1	leal	(%rbx,%rbx), %edi
0000000000304fd4	movl	%edi, 0x84(%r14)
0000000000304fdb	shlq	$0x2, %rdi
0000000000304fdf	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000304fe4	movq	%rax, %r12
0000000000304fe7	movq	%rax, 0x88(%r14)
0000000000304fee	leaq	(,%rbx,4), %rdx
0000000000304ff6	movq	%rax, %rdi
0000000000304ff9	movq	%r15, %rsi
0000000000304ffc	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305001	movl	%ebx, %edx
0000000000305003	testq	%r15, %r15
0000000000305006	je	0x305025
0000000000305008	movq	%r15, %rdi
000000000030500b	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000305010	movl	0x80(%r14), %edx
0000000000305017	movq	0x88(%r14), %r12
000000000030501e	jmp	0x305025
0000000000305020	movq	%r15, %r12
0000000000305023	movl	%ebx, %edx
0000000000305025	leaq	(%r12,%rbx,4), %rsi
0000000000305029	leaq	(%r12,%rbx,4), %rdi
000000000030502d	addq	$0x4, %rdi
0000000000305031	subl	%ebx, %edx
0000000000305033	shlq	$0x2, %rdx
0000000000305037	callq	0x6dff90                        ## symbol stub for: _memmove
000000000030503c	movq	-0x70(%rbp), %rax
0000000000305040	movss	0x4(%rax), %xmm0
0000000000305045	movq	0x88(%r14), %r15
000000000030504c	movss	%xmm0, (%r15,%rbx,4)
0000000000305052	movl	0x80(%r14), %ebx
0000000000305059	incl	%ebx
000000000030505b	movl	%ebx, 0x80(%r14)
0000000000305062	cmpl	0x84(%r14), %ebx
0000000000305069	jne	0x3050b0
000000000030506b	leal	(%rbx,%rbx), %edi
000000000030506e	movl	%edi, 0x84(%r14)
0000000000305075	shlq	$0x2, %rdi
0000000000305079	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030507e	movq	%rax, 0x88(%r14)
0000000000305085	leaq	(,%rbx,4), %rdx
000000000030508d	movq	%rax, %rdi
0000000000305090	movq	%r15, %rsi
0000000000305093	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305098	movq	%r15, %rdi
000000000030509b	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003050a0	movl	0x80(%r14), %edx
00000000003050a7	movq	0x88(%r14), %r15
00000000003050ae	jmp	0x3050b2
00000000003050b0	movl	%ebx, %edx
00000000003050b2	leaq	(%r15,%rbx,4), %rsi
00000000003050b6	leaq	(%r15,%rbx,4), %rdi
00000000003050ba	addq	$0x4, %rdi
00000000003050be	subl	%ebx, %edx
00000000003050c0	shlq	$0x2, %rdx
00000000003050c4	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003050c9	movq	-0x70(%rbp), %rax
00000000003050cd	movss	0x8(%rax), %xmm0
00000000003050d2	movq	0x88(%r14), %r15
00000000003050d9	movss	%xmm0, (%r15,%rbx,4)
00000000003050df	movl	0x80(%r14), %ebx
00000000003050e6	incl	%ebx
00000000003050e8	movl	%ebx, 0x80(%r14)
00000000003050ef	cmpl	0x84(%r14), %ebx
00000000003050f6	jne	0x305209
00000000003050fc	leal	(%rbx,%rbx), %edi
00000000003050ff	movl	%edi, 0x84(%r14)
0000000000305106	shlq	$0x2, %rdi
000000000030510a	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030510f	movq	%rax, 0x88(%r14)
0000000000305116	leaq	(,%rbx,4), %rdx
000000000030511e	movq	%rax, %rdi
0000000000305121	movq	%r15, %rsi
0000000000305124	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305129	movq	%r15, %rdi
000000000030512c	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000305131	movl	0x80(%r14), %edx
0000000000305138	movq	0x88(%r14), %r15
000000000030513f	jmp	0x30520b
0000000000305144	movq	%r12, %r15
0000000000305147	movl	%ebx, %edx
0000000000305149	leaq	(%r15,%rbx,8), %rsi
000000000030514d	leaq	(%r15,%rbx,8), %rdi
0000000000305151	addq	$0x8, %rdi
0000000000305155	subl	%ebx, %edx
0000000000305157	shlq	$0x3, %rdx
000000000030515b	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000305160	movq	0x98(%r14), %rax
0000000000305167	movq	-0x70(%rbp), %rcx
000000000030516b	movq	0x4(%rcx), %rcx
000000000030516f	movq	%rcx, (%rax,%rbx,8)
0000000000305173	movl	0x90(%r14), %ebx
000000000030517a	incl	%ebx
000000000030517c	movl	%ebx, 0x90(%r14)
0000000000305183	movq	0x98(%r14), %r15
000000000030518a	cmpl	0x94(%r14), %ebx
0000000000305191	jne	0x30529d
0000000000305197	leal	(%rbx,%rbx), %r13d
000000000030519b	movl	%r13d, 0x94(%r14)
00000000003051a2	leaq	(,%r13,8), %r14
00000000003051aa	movq	%r14, %rdi
00000000003051ad	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003051b2	movq	%rax, %r12
00000000003051b5	testl	%r13d, %r13d
00000000003051b8	je	0x3051c5
00000000003051ba	movq	%r12, %rdi
00000000003051bd	movq	%r14, %rsi
00000000003051c0	callq	0x6dfcba                        ## symbol stub for: ___bzero
00000000003051c5	movq	-0x58(%rbp), %r14
00000000003051c9	movq	%r12, 0x98(%r14)
00000000003051d0	leaq	(,%rbx,8), %rdx
00000000003051d8	movq	%r12, %rdi
00000000003051db	movq	%r15, %rsi
00000000003051de	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003051e3	movl	%ebx, %edx
00000000003051e5	testq	%r15, %r15
00000000003051e8	je	0x3052a2
00000000003051ee	movq	%r15, %rdi
00000000003051f1	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003051f6	movl	0x90(%r14), %edx
00000000003051fd	movq	0x98(%r14), %r12
0000000000305204	jmp	0x3052a2
0000000000305209	movl	%ebx, %edx
000000000030520b	leaq	(%r15,%rbx,4), %rsi
000000000030520f	leaq	(%r15,%rbx,4), %rdi
0000000000305213	addq	$0x4, %rdi
0000000000305217	subl	%ebx, %edx
0000000000305219	shlq	$0x2, %rdx
000000000030521d	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000305222	movq	-0x70(%rbp), %rax
0000000000305226	movss	0xc(%rax), %xmm0
000000000030522b	movq	0x88(%r14), %r15
0000000000305232	movss	%xmm0, (%r15,%rbx,4)
0000000000305238	movl	0x80(%r14), %ebx
000000000030523f	incl	%ebx
0000000000305241	movl	%ebx, 0x80(%r14)
0000000000305248	cmpl	0x84(%r14), %ebx
000000000030524f	jne	0x305364
0000000000305255	leal	(%rbx,%rbx), %edi
0000000000305258	movl	%edi, 0x84(%r14)
000000000030525f	shlq	$0x2, %rdi
0000000000305263	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000305268	movq	%rax, 0x88(%r14)
000000000030526f	leaq	(,%rbx,4), %rdx
0000000000305277	movq	%rax, %rdi
000000000030527a	movq	%r15, %rsi
000000000030527d	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305282	movq	%r15, %rdi
0000000000305285	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030528a	movl	0x80(%r14), %edx
0000000000305291	movq	0x88(%r14), %r15
0000000000305298	jmp	0x305366
000000000030529d	movq	%r15, %r12
00000000003052a0	movl	%ebx, %edx
00000000003052a2	leaq	(%r12,%rbx,8), %rsi
00000000003052a6	leaq	(%r12,%rbx,8), %rdi
00000000003052aa	addq	$0x8, %rdi
00000000003052ae	subl	%ebx, %edx
00000000003052b0	shlq	$0x3, %rdx
00000000003052b4	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003052b9	movq	0x98(%r14), %rax
00000000003052c0	movq	-0xb0(%rbp), %rcx
00000000003052c7	movq	(%rcx), %rcx
00000000003052ca	movq	%rcx, (%rax,%rbx,8)
00000000003052ce	movl	0x90(%r14), %ebx
00000000003052d5	incl	%ebx
00000000003052d7	movl	%ebx, 0x90(%r14)
00000000003052de	movq	0x98(%r14), %r15
00000000003052e5	cmpl	0x94(%r14), %ebx
00000000003052ec	jne	0x30540a
00000000003052f2	leal	(%rbx,%rbx), %r13d
00000000003052f6	movl	%r13d, 0x94(%r14)
00000000003052fd	leaq	(,%r13,8), %r14
0000000000305305	movq	%r14, %rdi
0000000000305308	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030530d	movq	%rax, %r12
0000000000305310	testl	%r13d, %r13d
0000000000305313	je	0x305320
0000000000305315	movq	%r12, %rdi
0000000000305318	movq	%r14, %rsi
000000000030531b	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000305320	movq	-0x58(%rbp), %r14
0000000000305324	movq	%r12, 0x98(%r14)
000000000030532b	leaq	(,%rbx,8), %rdx
0000000000305333	movq	%r12, %rdi
0000000000305336	movq	%r15, %rsi
0000000000305339	callq	0x6dff8a                        ## symbol stub for: _memcpy
000000000030533e	movl	%ebx, %edx
0000000000305340	testq	%r15, %r15
0000000000305343	je	0x30540f
0000000000305349	movq	%r15, %rdi
000000000030534c	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000305351	movl	0x90(%r14), %edx
0000000000305358	movq	0x98(%r14), %r12
000000000030535f	jmp	0x30540f
0000000000305364	movl	%ebx, %edx
0000000000305366	leaq	(%r15,%rbx,4), %rsi
000000000030536a	leaq	(%r15,%rbx,4), %rdi
000000000030536e	addq	$0x4, %rdi
0000000000305372	subl	%ebx, %edx
0000000000305374	shlq	$0x2, %rdx
0000000000305378	callq	0x6dff90                        ## symbol stub for: _memmove
000000000030537d	movq	-0x70(%rbp), %rax
0000000000305381	movss	0x10(%rax), %xmm0
0000000000305386	movq	0x88(%r14), %rax
000000000030538d	movss	%xmm0, (%rax,%rbx,4)
0000000000305392	incl	0x80(%r14)
0000000000305399	movl	0xa0(%r14), %ebx
00000000003053a0	movq	0xa8(%r14), %r15
00000000003053a7	cmpl	0xa4(%r14), %ebx
00000000003053ae	jne	0x3054b1
00000000003053b4	leal	(%rbx,%rbx), %edi
00000000003053b7	movl	%edi, 0xa4(%r14)
00000000003053be	shlq	$0x3, %rdi
00000000003053c2	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003053c7	movq	%rax, %r12
00000000003053ca	movq	%rax, 0xa8(%r14)
00000000003053d1	leaq	(,%rbx,8), %rdx
00000000003053d9	movq	%rax, %rdi
00000000003053dc	movq	%r15, %rsi
00000000003053df	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003053e4	movl	%ebx, %edx
00000000003053e6	testq	%r15, %r15
00000000003053e9	je	0x3054b6
00000000003053ef	movq	%r15, %rdi
00000000003053f2	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003053f7	movl	0xa0(%r14), %edx
00000000003053fe	movq	0xa8(%r14), %r12
0000000000305405	jmp	0x3054b6
000000000030540a	movq	%r15, %r12
000000000030540d	movl	%ebx, %edx
000000000030540f	leaq	(%r12,%rbx,8), %rsi
0000000000305413	leaq	(%r12,%rbx,8), %rdi
0000000000305417	addq	$0x8, %rdi
000000000030541b	subl	%ebx, %edx
000000000030541d	shlq	$0x3, %rdx
0000000000305421	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000305426	movq	0x98(%r14), %rax
000000000030542d	movq	-0x70(%rbp), %rcx
0000000000305431	movq	0xc(%rcx), %rcx
0000000000305435	movq	%rcx, (%rax,%rbx,8)
0000000000305439	incl	0x90(%r14)
0000000000305440	movl	0x80(%r14), %ebx
0000000000305447	movq	0x88(%r14), %r15
000000000030544e	cmpl	0x84(%r14), %ebx
0000000000305455	jne	0x3055bb
000000000030545b	leal	(%rbx,%rbx), %edi
000000000030545e	movl	%edi, 0x84(%r14)
0000000000305465	shlq	$0x2, %rdi
0000000000305469	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030546e	movq	%rax, %r12
0000000000305471	movq	%rax, 0x88(%r14)
0000000000305478	leaq	(,%rbx,4), %rdx
0000000000305480	movq	%rax, %rdi
0000000000305483	movq	%r15, %rsi
0000000000305486	callq	0x6dff8a                        ## symbol stub for: _memcpy
000000000030548b	movl	%ebx, %edx
000000000030548d	testq	%r15, %r15
0000000000305490	je	0x3055c0
0000000000305496	movq	%r15, %rdi
0000000000305499	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030549e	movl	0x80(%r14), %edx
00000000003054a5	movq	0x88(%r14), %r12
00000000003054ac	jmp	0x3055c0
00000000003054b1	movq	%r15, %r12
00000000003054b4	movl	%ebx, %edx
00000000003054b6	movq	-0x78(%rbp), %r15
00000000003054ba	leal	0x1(%r15), %r14d
00000000003054be	leaq	(%r12,%rbx,8), %rsi
00000000003054c2	leaq	(%r12,%rbx,8), %rdi
00000000003054c6	addq	$0x8, %rdi
00000000003054ca	subl	%ebx, %edx
00000000003054cc	shlq	$0x3, %rdx
00000000003054d0	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003054d5	movq	-0x58(%rbp), %rax
00000000003054d9	movq	0xa8(%rax), %rax
00000000003054e0	shlq	$0x20, %r14
00000000003054e4	movl	%r15d, %ecx
00000000003054e7	orq	%r14, %rcx
00000000003054ea	movq	-0x58(%rbp), %rdx
00000000003054ee	movq	%rcx, (%rax,%rbx,8)
00000000003054f2	incl	0xa0(%rdx)
00000000003054f8	movq	-0x70(%rbp), %rax
00000000003054fc	movups	0x4(%rax), %xmm0
0000000000305500	movaps	%xmm0, -0xb0(%rbp)
0000000000305507	movl	0xd0(%rdx), %ebx
000000000030550d	movq	0xd8(%rdx), %r13
0000000000305514	cmpl	0xd4(%rdx), %ebx
000000000030551a	jne	0x305652
0000000000305520	leal	(%rbx,%rbx), %r12d
0000000000305524	movl	%r12d, 0xd4(%rdx)
000000000030552b	leaq	(,%r12,4), %rax
0000000000305533	leaq	(%rax,%rax,4), %r14
0000000000305537	movq	%r14, %rdi
000000000030553a	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030553f	movq	%rax, %r15
0000000000305542	testl	%r12d, %r12d
0000000000305545	je	0x305573
0000000000305547	addq	$-0x14, %r14
000000000030554b	movq	%r14, %rax
000000000030554e	movabsq	$-0x3333333333333333, %rcx      ## imm = 0xCCCCCCCCCCCCCCCD
0000000000305558	mulq	%rcx
000000000030555b	shrq	$0x4, %rdx
000000000030555f	leaq	(%rdx,%rdx,4), %rax
0000000000305563	leaq	0x14(,%rax,4), %rsi
000000000030556b	movq	%r15, %rdi
000000000030556e	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000305573	movq	-0x58(%rbp), %r14
0000000000305577	movq	%r15, 0xd8(%r14)
000000000030557e	leaq	(,%rbx,4), %rax
0000000000305586	leaq	(%rax,%rax,4), %rdx
000000000030558a	movq	%r15, %rdi
000000000030558d	movq	%r13, %rsi
0000000000305590	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305595	movl	%ebx, %eax
0000000000305597	testq	%r13, %r13
000000000030559a	je	0x305657
00000000003055a0	movq	%r13, %rdi
00000000003055a3	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003055a8	movl	0xd0(%r14), %eax
00000000003055af	movq	0xd8(%r14), %r15
00000000003055b6	jmp	0x305657
00000000003055bb	movq	%r15, %r12
00000000003055be	movl	%ebx, %edx
00000000003055c0	leaq	(%r12,%rbx,4), %rsi
00000000003055c4	leaq	(%r12,%rbx,4), %rdi
00000000003055c8	addq	$0x4, %rdi
00000000003055cc	subl	%ebx, %edx
00000000003055ce	shlq	$0x2, %rdx
00000000003055d2	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003055d7	movq	-0x70(%rbp), %rax
00000000003055db	movss	0x4(%rax), %xmm0
00000000003055e0	movq	0x88(%r14), %r15
00000000003055e7	movss	%xmm0, (%r15,%rbx,4)
00000000003055ed	movl	0x80(%r14), %ebx
00000000003055f4	incl	%ebx
00000000003055f6	movl	%ebx, 0x80(%r14)
00000000003055fd	cmpl	0x84(%r14), %ebx
0000000000305604	jne	0x30576d
000000000030560a	leal	(%rbx,%rbx), %edi
000000000030560d	movl	%edi, 0x84(%r14)
0000000000305614	shlq	$0x2, %rdi
0000000000305618	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030561d	movq	%rax, 0x88(%r14)
0000000000305624	leaq	(,%rbx,4), %rdx
000000000030562c	movq	%rax, %rdi
000000000030562f	movq	%r15, %rsi
0000000000305632	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305637	movq	%r15, %rdi
000000000030563a	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030563f	movl	0x80(%r14), %edx
0000000000305646	movq	0x88(%r14), %r15
000000000030564d	jmp	0x30576f
0000000000305652	movq	%r13, %r15
0000000000305655	movl	%ebx, %eax
0000000000305657	leaq	(,%rbx,4), %rcx
000000000030565f	leaq	(%rcx,%rcx,4), %r14
0000000000305663	leaq	(%r15,%r14), %rdi
0000000000305667	addq	$0x14, %rdi
000000000030566b	addq	%r14, %r15
000000000030566e	subl	%ebx, %eax
0000000000305670	shlq	$0x2, %rax
0000000000305674	leaq	(%rax,%rax,4), %rdx
0000000000305678	movq	%r15, %rsi
000000000030567b	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000305680	movq	-0x58(%rbp), %rax
0000000000305684	movq	0xd8(%rax), %rax
000000000030568b	movl	$0x0, (%rax,%r14)
0000000000305693	movaps	-0xb0(%rbp), %xmm0
000000000030569a	movups	%xmm0, 0x4(%rax,%r14)
00000000003056a0	movq	-0x58(%rbp), %rax
00000000003056a4	incl	0xd0(%rax)
00000000003056aa	movq	-0x70(%rbp), %rcx
00000000003056ae	movups	0x4(%rcx), %xmm0
00000000003056b2	movaps	%xmm0, -0xb0(%rbp)
00000000003056b9	movl	0xe0(%rax), %ebx
00000000003056bf	movq	0xe8(%rax), %r13
00000000003056c6	cmpl	0xe4(%rax), %ebx
00000000003056cc	jne	0x305801
00000000003056d2	leal	(%rbx,%rbx), %r12d
00000000003056d6	movl	%r12d, 0xe4(%rax)
00000000003056dd	leaq	(,%r12,4), %rax
00000000003056e5	leaq	(%rax,%rax,4), %r14
00000000003056e9	movq	%r14, %rdi
00000000003056ec	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003056f1	movq	%rax, %r15
00000000003056f4	testl	%r12d, %r12d
00000000003056f7	je	0x305725
00000000003056f9	addq	$-0x14, %r14
00000000003056fd	movq	%r14, %rax
0000000000305700	movabsq	$-0x3333333333333333, %rcx      ## imm = 0xCCCCCCCCCCCCCCCD
000000000030570a	mulq	%rcx
000000000030570d	shrq	$0x4, %rdx
0000000000305711	leaq	(%rdx,%rdx,4), %rax
0000000000305715	leaq	0x14(,%rax,4), %rsi
000000000030571d	movq	%r15, %rdi
0000000000305720	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000305725	movq	-0x58(%rbp), %r14
0000000000305729	movq	%r15, 0xe8(%r14)
0000000000305730	leaq	(,%rbx,4), %rax
0000000000305738	leaq	(%rax,%rax,4), %rdx
000000000030573c	movq	%r15, %rdi
000000000030573f	movq	%r13, %rsi
0000000000305742	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305747	movl	%ebx, %eax
0000000000305749	testq	%r13, %r13
000000000030574c	je	0x305806
0000000000305752	movq	%r13, %rdi
0000000000305755	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030575a	movl	0xe0(%r14), %eax
0000000000305761	movq	0xe8(%r14), %r15
0000000000305768	jmp	0x305806
000000000030576d	movl	%ebx, %edx
000000000030576f	leaq	(%r15,%rbx,4), %rsi
0000000000305773	leaq	(%r15,%rbx,4), %rdi
0000000000305777	addq	$0x4, %rdi
000000000030577b	subl	%ebx, %edx
000000000030577d	shlq	$0x2, %rdx
0000000000305781	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000305786	movq	-0x70(%rbp), %rax
000000000030578a	movss	0x8(%rax), %xmm0
000000000030578f	movq	0x88(%r14), %r15
0000000000305796	movss	%xmm0, (%r15,%rbx,4)
000000000030579c	movl	0x80(%r14), %ebx
00000000003057a3	incl	%ebx
00000000003057a5	movl	%ebx, 0x80(%r14)
00000000003057ac	cmpl	0x84(%r14), %ebx
00000000003057b3	jne	0x3058be
00000000003057b9	leal	(%rbx,%rbx), %edi
00000000003057bc	movl	%edi, 0x84(%r14)
00000000003057c3	shlq	$0x2, %rdi
00000000003057c7	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003057cc	movq	%rax, 0x88(%r14)
00000000003057d3	leaq	(,%rbx,4), %rdx
00000000003057db	movq	%rax, %rdi
00000000003057de	movq	%r15, %rsi
00000000003057e1	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003057e6	movq	%r15, %rdi
00000000003057e9	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003057ee	movl	0x80(%r14), %edx
00000000003057f5	movq	0x88(%r14), %r15
00000000003057fc	jmp	0x3058c0
0000000000305801	movq	%r13, %r15
0000000000305804	movl	%ebx, %eax
0000000000305806	leaq	(,%rbx,4), %rcx
000000000030580e	leaq	(%rcx,%rcx,4), %r14
0000000000305812	leaq	(%r15,%r14), %rdi
0000000000305816	addq	$0x14, %rdi
000000000030581a	addq	%r14, %r15
000000000030581d	subl	%ebx, %eax
000000000030581f	shlq	$0x2, %rax
0000000000305823	leaq	(%rax,%rax,4), %rdx
0000000000305827	movq	%r15, %rsi
000000000030582a	callq	0x6dff90                        ## symbol stub for: _memmove
000000000030582f	movq	-0x58(%rbp), %rax
0000000000305833	movq	0xe8(%rax), %rax
000000000030583a	movl	$0x0, (%rax,%r14)
0000000000305842	movaps	-0xb0(%rbp), %xmm0
0000000000305849	movups	%xmm0, 0x4(%rax,%r14)
000000000030584f	movq	-0x58(%rbp), %r14
0000000000305853	incl	0xe0(%r14)
000000000030585a	movq	-0x70(%rbp), %rax
000000000030585e	movsd	0x4(%rax), %xmm3
0000000000305863	movsd	0xc(%rax), %xmm1
0000000000305868	movss	0x8(%rax), %xmm4
000000000030586d	movaps	%xmm3, %xmm2
0000000000305870	insertps	$0x10, %xmm4, %xmm2             ## xmm2 = xmm2[0],xmm4[0],xmm2[2,3]
0000000000305876	movss	0x10(%rax), %xmm5
000000000030587b	movaps	%xmm1, %xmm0
000000000030587e	insertps	$0x10, %xmm5, %xmm0             ## xmm0 = xmm0[0],xmm5[0],xmm0[2,3]
0000000000305884	cmpltps	%xmm2, %xmm0
0000000000305888	movaps	%xmm3, %xmm2
000000000030588b	blendvps	%xmm0, %xmm1, %xmm2
0000000000305890	minps	-0x90(%rbp), %xmm2
0000000000305897	maxss	%xmm3, %xmm1
000000000030589b	movaps	-0xa0(%rbp), %xmm3
00000000003058a2	movaps	%xmm3, %xmm0
00000000003058a5	insertps	$0x10, %xmm4, %xmm0             ## xmm0 = xmm0[0],xmm4[0],xmm0[2,3]
00000000003058ab	insertps	$0x10, %xmm5, %xmm1             ## xmm1 = xmm1[0],xmm5[0],xmm1[2,3]
00000000003058b1	maxps	%xmm0, %xmm1
00000000003058b4	movl	$0x2, %eax
00000000003058b9	jmp	0x306094
00000000003058be	movl	%ebx, %edx
00000000003058c0	movq	-0xb0(%rbp), %r12
00000000003058c7	leaq	(%r15,%rbx,4), %rsi
00000000003058cb	leaq	(%r15,%rbx,4), %rdi
00000000003058cf	addq	$0x4, %rdi
00000000003058d3	subl	%ebx, %edx
00000000003058d5	shlq	$0x2, %rdx
00000000003058d9	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003058de	movss	(%r12), %xmm0
00000000003058e4	movq	0x88(%r14), %r15
00000000003058eb	movss	%xmm0, (%r15,%rbx,4)
00000000003058f1	movl	0x80(%r14), %ebx
00000000003058f8	incl	%ebx
00000000003058fa	movl	%ebx, 0x80(%r14)
0000000000305901	cmpl	0x84(%r14), %ebx
0000000000305908	jne	0x30594f
000000000030590a	leal	(%rbx,%rbx), %edi
000000000030590d	movl	%edi, 0x84(%r14)
0000000000305914	shlq	$0x2, %rdi
0000000000305918	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030591d	movq	%rax, 0x88(%r14)
0000000000305924	leaq	(,%rbx,4), %rdx
000000000030592c	movq	%rax, %rdi
000000000030592f	movq	%r15, %rsi
0000000000305932	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305937	movq	%r15, %rdi
000000000030593a	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030593f	movl	0x80(%r14), %edx
0000000000305946	movq	0x88(%r14), %r15
000000000030594d	jmp	0x305951
000000000030594f	movl	%ebx, %edx
0000000000305951	leaq	(%r15,%rbx,4), %rsi
0000000000305955	leaq	(%r15,%rbx,4), %rdi
0000000000305959	addq	$0x4, %rdi
000000000030595d	subl	%ebx, %edx
000000000030595f	shlq	$0x2, %rdx
0000000000305963	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000305968	movq	-0x70(%rbp), %rax
000000000030596c	movss	0x18(%rax), %xmm0
0000000000305971	movq	0x88(%r14), %r15
0000000000305978	movss	%xmm0, (%r15,%rbx,4)
000000000030597e	movl	0x80(%r14), %ebx
0000000000305985	incl	%ebx
0000000000305987	movl	%ebx, 0x80(%r14)
000000000030598e	cmpl	0x84(%r14), %ebx
0000000000305995	jne	0x3059dc
0000000000305997	leal	(%rbx,%rbx), %edi
000000000030599a	movl	%edi, 0x84(%r14)
00000000003059a1	shlq	$0x2, %rdi
00000000003059a5	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003059aa	movq	%rax, 0x88(%r14)
00000000003059b1	leaq	(,%rbx,4), %rdx
00000000003059b9	movq	%rax, %rdi
00000000003059bc	movq	%r15, %rsi
00000000003059bf	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003059c4	movq	%r15, %rdi
00000000003059c7	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003059cc	movl	0x80(%r14), %edx
00000000003059d3	movq	0x88(%r14), %r15
00000000003059da	jmp	0x3059de
00000000003059dc	movl	%ebx, %edx
00000000003059de	leaq	(%r15,%rbx,4), %rsi
00000000003059e2	leaq	(%r15,%rbx,4), %rdi
00000000003059e6	addq	$0x4, %rdi
00000000003059ea	subl	%ebx, %edx
00000000003059ec	shlq	$0x2, %rdx
00000000003059f0	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003059f5	movq	-0x70(%rbp), %rax
00000000003059f9	movss	0xc(%rax), %xmm0
00000000003059fe	movq	0x88(%r14), %r15
0000000000305a05	movss	%xmm0, (%r15,%rbx,4)
0000000000305a0b	movl	0x80(%r14), %ebx
0000000000305a12	incl	%ebx
0000000000305a14	movl	%ebx, 0x80(%r14)
0000000000305a1b	cmpl	0x84(%r14), %ebx
0000000000305a22	jne	0x305a69
0000000000305a24	leal	(%rbx,%rbx), %edi
0000000000305a27	movl	%edi, 0x84(%r14)
0000000000305a2e	shlq	$0x2, %rdi
0000000000305a32	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000305a37	movq	%rax, 0x88(%r14)
0000000000305a3e	leaq	(,%rbx,4), %rdx
0000000000305a46	movq	%rax, %rdi
0000000000305a49	movq	%r15, %rsi
0000000000305a4c	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305a51	movq	%r15, %rdi
0000000000305a54	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000305a59	movl	0x80(%r14), %edx
0000000000305a60	movq	0x88(%r14), %r15
0000000000305a67	jmp	0x305a6b
0000000000305a69	movl	%ebx, %edx
0000000000305a6b	leaq	(%r15,%rbx,4), %rsi
0000000000305a6f	leaq	(%r15,%rbx,4), %rdi
0000000000305a73	addq	$0x4, %rdi
0000000000305a77	subl	%ebx, %edx
0000000000305a79	shlq	$0x2, %rdx
0000000000305a7d	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000305a82	movq	-0x70(%rbp), %rax
0000000000305a86	movss	0x10(%rax), %xmm0
0000000000305a8b	movq	0x88(%r14), %rax
0000000000305a92	movss	%xmm0, (%rax,%rbx,4)
0000000000305a97	incl	0x80(%r14)
0000000000305a9e	movl	0xa0(%r14), %ebx
0000000000305aa5	movq	0xa8(%r14), %r15
0000000000305aac	cmpl	0xa4(%r14), %ebx
0000000000305ab3	jne	0x305b04
0000000000305ab5	leal	(%rbx,%rbx), %edi
0000000000305ab8	movl	%edi, 0xa4(%r14)
0000000000305abf	shlq	$0x3, %rdi
0000000000305ac3	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000305ac8	movq	%rax, %r12
0000000000305acb	movq	%rax, 0xa8(%r14)
0000000000305ad2	leaq	(,%rbx,8), %rdx
0000000000305ada	movq	%rax, %rdi
0000000000305add	movq	%r15, %rsi
0000000000305ae0	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305ae5	movl	%ebx, %edx
0000000000305ae7	testq	%r15, %r15
0000000000305aea	je	0x305b09
0000000000305aec	movq	%r15, %rdi
0000000000305aef	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000305af4	movl	0xa0(%r14), %edx
0000000000305afb	movq	0xa8(%r14), %r12
0000000000305b02	jmp	0x305b09
0000000000305b04	movq	%r15, %r12
0000000000305b07	movl	%ebx, %edx
0000000000305b09	movq	%r14, %r13
0000000000305b0c	movq	-0x78(%rbp), %r15
0000000000305b10	leal	0x1(%r15), %r14d
0000000000305b14	leaq	(%r12,%rbx,8), %rsi
0000000000305b18	leaq	(%r12,%rbx,8), %rdi
0000000000305b1c	addq	$0x8, %rdi
0000000000305b20	subl	%ebx, %edx
0000000000305b22	shlq	$0x3, %rdx
0000000000305b26	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000305b2b	movq	0xa8(%r13), %rax
0000000000305b32	movl	%r14d, %ecx
0000000000305b35	movq	%rcx, -0xb0(%rbp)
0000000000305b3c	shlq	$0x20, %rcx
0000000000305b40	movl	%r15d, %edx
0000000000305b43	movq	%rdx, -0xe0(%rbp)
0000000000305b4a	orq	%rdx, %rcx
0000000000305b4d	movq	%rcx, (%rax,%rbx,8)
0000000000305b51	movl	0xa0(%r13), %r14d
0000000000305b58	incl	%r14d
0000000000305b5b	movl	%r14d, 0xa0(%r13)
0000000000305b62	movq	0xa8(%r13), %r15
0000000000305b69	cmpl	0xa4(%r13), %r14d
0000000000305b70	jne	0x305bc3
0000000000305b72	leal	(%r14,%r14), %edi
0000000000305b76	movl	%edi, 0xa4(%r13)
0000000000305b7d	shlq	$0x3, %rdi
0000000000305b81	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000305b86	movq	%rax, %r12
0000000000305b89	movq	%rax, 0xa8(%r13)
0000000000305b90	leaq	(,%r14,8), %rdx
0000000000305b98	movq	%rax, %rdi
0000000000305b9b	movq	%r15, %rsi
0000000000305b9e	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305ba3	movl	%r14d, %edx
0000000000305ba6	testq	%r15, %r15
0000000000305ba9	je	0x305bc9
0000000000305bab	movq	%r15, %rdi
0000000000305bae	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000305bb3	movl	0xa0(%r13), %edx
0000000000305bba	movq	0xa8(%r13), %r12
0000000000305bc1	jmp	0x305bc9
0000000000305bc3	movq	%r15, %r12
0000000000305bc6	movl	%r14d, %edx
0000000000305bc9	movq	-0x78(%rbp), %rax
0000000000305bcd	leal	0x2(%rax), %ebx
0000000000305bd0	leaq	(%r12,%r14,8), %rsi
0000000000305bd4	leaq	(%r12,%r14,8), %rdi
0000000000305bd8	addq	$0x8, %rdi
0000000000305bdc	subl	%r14d, %edx
0000000000305bdf	shlq	$0x3, %rdx
0000000000305be3	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000305be8	movq	0xa8(%r13), %rax
0000000000305bef	shlq	$0x20, %rbx
0000000000305bf3	movq	-0xb0(%rbp), %rcx
0000000000305bfa	orq	%rbx, %rcx
0000000000305bfd	movq	%rcx, (%rax,%r14,8)
0000000000305c01	movl	0xa0(%r13), %r14d
0000000000305c08	incl	%r14d
0000000000305c0b	movl	%r14d, 0xa0(%r13)
0000000000305c12	movq	0xa8(%r13), %r15
0000000000305c19	cmpl	0xa4(%r13), %r14d
0000000000305c20	jne	0x305c73
0000000000305c22	leal	(%r14,%r14), %edi
0000000000305c26	movl	%edi, 0xa4(%r13)
0000000000305c2d	shlq	$0x3, %rdi
0000000000305c31	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000305c36	movq	%rax, %r12
0000000000305c39	movq	%rax, 0xa8(%r13)
0000000000305c40	leaq	(,%r14,8), %rdx
0000000000305c48	movq	%rax, %rdi
0000000000305c4b	movq	%r15, %rsi
0000000000305c4e	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305c53	movl	%r14d, %edx
0000000000305c56	testq	%r15, %r15
0000000000305c59	je	0x305c79
0000000000305c5b	movq	%r15, %rdi
0000000000305c5e	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000305c63	movl	0xa0(%r13), %edx
0000000000305c6a	movq	0xa8(%r13), %r12
0000000000305c71	jmp	0x305c79
0000000000305c73	movq	%r15, %r12
0000000000305c76	movl	%r14d, %edx
0000000000305c79	leaq	(%r12,%r14,8), %rsi
0000000000305c7d	leaq	(%r12,%r14,8), %rdi
0000000000305c81	addq	$0x8, %rdi
0000000000305c85	subl	%r14d, %edx
0000000000305c88	shlq	$0x3, %rdx
0000000000305c8c	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000305c91	movq	0xa8(%r13), %rax
0000000000305c98	orq	-0xe0(%rbp), %rbx
0000000000305c9f	movq	%rbx, (%rax,%r14,8)
0000000000305ca3	incl	0xa0(%r13)
0000000000305caa	movq	-0x70(%rbp), %rax
0000000000305cae	movsd	0x4(%rax), %xmm0
0000000000305cb3	movaps	%xmm0, -0xb0(%rbp)
0000000000305cba	movsd	0x14(%rax), %xmm0
0000000000305cbf	movaps	%xmm0, -0xe0(%rbp)
0000000000305cc6	movl	0xd0(%r13), %ebx
0000000000305ccd	movq	0xd8(%r13), %r15
0000000000305cd4	cmpl	0xd4(%r13), %ebx
0000000000305cdb	jne	0x305d83
0000000000305ce1	movq	%r15, -0x118(%rbp)
0000000000305ce8	leal	(%rbx,%rbx), %r12d
0000000000305cec	movl	%r12d, 0xd4(%r13)
0000000000305cf3	leaq	(,%r12,4), %rax
0000000000305cfb	leaq	(%rax,%rax,4), %r14
0000000000305cff	movq	%r14, %rdi
0000000000305d02	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000305d07	movq	%rax, %r15
0000000000305d0a	testl	%r12d, %r12d
0000000000305d0d	je	0x305d3b
0000000000305d0f	addq	$-0x14, %r14
0000000000305d13	movq	%r14, %rax
0000000000305d16	movabsq	$-0x3333333333333333, %rcx      ## imm = 0xCCCCCCCCCCCCCCCD
0000000000305d20	mulq	%rcx
0000000000305d23	shrq	$0x4, %rdx
0000000000305d27	leaq	(%rdx,%rdx,4), %rax
0000000000305d2b	leaq	0x14(,%rax,4), %rsi
0000000000305d33	movq	%r15, %rdi
0000000000305d36	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000305d3b	movq	-0x58(%rbp), %r14
0000000000305d3f	movq	%r15, 0xd8(%r14)
0000000000305d46	leaq	(,%rbx,4), %rax
0000000000305d4e	leaq	(%rax,%rax,4), %rdx
0000000000305d52	movq	%r15, %rdi
0000000000305d55	movq	-0x118(%rbp), %r12
0000000000305d5c	movq	%r12, %rsi
0000000000305d5f	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305d64	movl	%ebx, %eax
0000000000305d66	testq	%r12, %r12
0000000000305d69	je	0x305d85
0000000000305d6b	movq	%r12, %rdi
0000000000305d6e	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000305d73	movl	0xd0(%r14), %eax
0000000000305d7a	movq	0xd8(%r14), %r15
0000000000305d81	jmp	0x305d85
0000000000305d83	movl	%ebx, %eax
0000000000305d85	leaq	(,%rbx,4), %rcx
0000000000305d8d	leaq	(%rcx,%rcx,4), %r14
0000000000305d91	leaq	(%r15,%r14), %rdi
0000000000305d95	addq	$0x14, %rdi
0000000000305d99	addq	%r14, %r15
0000000000305d9c	subl	%ebx, %eax
0000000000305d9e	shlq	$0x2, %rax
0000000000305da2	leaq	(%rax,%rax,4), %rdx
0000000000305da6	movq	%r15, %rsi
0000000000305da9	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000305dae	movq	-0x58(%rbp), %rax
0000000000305db2	movq	0xd8(%rax), %rax
0000000000305db9	movl	$0x0, (%rax,%r14)
0000000000305dc1	movaps	-0xb0(%rbp), %xmm0
0000000000305dc8	unpcklpd	-0xe0(%rbp), %xmm0              ## xmm0 = xmm0[0],mem[0]
0000000000305dd0	movups	%xmm0, 0x4(%rax,%r14)
0000000000305dd6	movq	-0x58(%rbp), %rax
0000000000305dda	movl	0xd0(%rax), %ebx
0000000000305de0	incl	%ebx
0000000000305de2	movl	%ebx, 0xd0(%rax)
0000000000305de8	movq	-0x70(%rbp), %rcx
0000000000305dec	movups	0xc(%rcx), %xmm0
0000000000305df0	movaps	%xmm0, -0xb0(%rbp)
0000000000305df7	movq	0xd8(%rax), %r13
0000000000305dfe	cmpl	0xd4(%rax), %ebx
0000000000305e04	jne	0x305e9e
0000000000305e0a	leal	(%rbx,%rbx), %r12d
0000000000305e0e	movl	%r12d, 0xd4(%rax)
0000000000305e15	leaq	(,%r12,4), %rax
0000000000305e1d	leaq	(%rax,%rax,4), %r14
0000000000305e21	movq	%r14, %rdi
0000000000305e24	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000305e29	movq	%rax, %r15
0000000000305e2c	testl	%r12d, %r12d
0000000000305e2f	je	0x305e5d
0000000000305e31	addq	$-0x14, %r14
0000000000305e35	movq	%r14, %rax
0000000000305e38	movabsq	$-0x3333333333333333, %rcx      ## imm = 0xCCCCCCCCCCCCCCCD
0000000000305e42	mulq	%rcx
0000000000305e45	shrq	$0x4, %rdx
0000000000305e49	leaq	(%rdx,%rdx,4), %rax
0000000000305e4d	leaq	0x14(,%rax,4), %rsi
0000000000305e55	movq	%r15, %rdi
0000000000305e58	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000305e5d	movq	-0x58(%rbp), %r14
0000000000305e61	movq	%r15, 0xd8(%r14)
0000000000305e68	leaq	(,%rbx,4), %rax
0000000000305e70	leaq	(%rax,%rax,4), %rdx
0000000000305e74	movq	%r15, %rdi
0000000000305e77	movq	%r13, %rsi
0000000000305e7a	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305e7f	movl	%ebx, %eax
0000000000305e81	testq	%r13, %r13
0000000000305e84	je	0x305ea3
0000000000305e86	movq	%r13, %rdi
0000000000305e89	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000305e8e	movl	0xd0(%r14), %eax
0000000000305e95	movq	0xd8(%r14), %r15
0000000000305e9c	jmp	0x305ea3
0000000000305e9e	movq	%r13, %r15
0000000000305ea1	movl	%ebx, %eax
0000000000305ea3	leaq	(,%rbx,4), %rcx
0000000000305eab	leaq	(%rcx,%rcx,4), %r14
0000000000305eaf	leaq	(%r15,%r14), %rdi
0000000000305eb3	addq	$0x14, %rdi
0000000000305eb7	addq	%r14, %r15
0000000000305eba	subl	%ebx, %eax
0000000000305ebc	shlq	$0x2, %rax
0000000000305ec0	leaq	(%rax,%rax,4), %rdx
0000000000305ec4	movq	%r15, %rsi
0000000000305ec7	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000305ecc	movq	-0x58(%rbp), %rax
0000000000305ed0	movq	0xd8(%rax), %rax
0000000000305ed7	movl	$0x0, (%rax,%r14)
0000000000305edf	movaps	-0xb0(%rbp), %xmm0
0000000000305ee6	shufps	$0x4e, %xmm0, %xmm0             ## xmm0 = xmm0[2,3,0,1]
0000000000305eea	movups	%xmm0, 0x4(%rax,%r14)
0000000000305ef0	movq	-0x58(%rbp), %rax
0000000000305ef4	movl	0xd0(%rax), %ebx
0000000000305efa	incl	%ebx
0000000000305efc	movl	%ebx, 0xd0(%rax)
0000000000305f02	movq	-0x70(%rbp), %rcx
0000000000305f06	movups	0x4(%rcx), %xmm0
0000000000305f0a	movaps	%xmm0, -0xb0(%rbp)
0000000000305f11	movq	0xd8(%rax), %r13
0000000000305f18	cmpl	0xd4(%rax), %ebx
0000000000305f1e	jne	0x305fb8
0000000000305f24	leal	(%rbx,%rbx), %r12d
0000000000305f28	movl	%r12d, 0xd4(%rax)
0000000000305f2f	leaq	(,%r12,4), %rax
0000000000305f37	leaq	(%rax,%rax,4), %r14
0000000000305f3b	movq	%r14, %rdi
0000000000305f3e	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000305f43	movq	%rax, %r15
0000000000305f46	testl	%r12d, %r12d
0000000000305f49	je	0x305f77
0000000000305f4b	addq	$-0x14, %r14
0000000000305f4f	movq	%r14, %rax
0000000000305f52	movabsq	$-0x3333333333333333, %rcx      ## imm = 0xCCCCCCCCCCCCCCCD
0000000000305f5c	mulq	%rcx
0000000000305f5f	shrq	$0x4, %rdx
0000000000305f63	leaq	(%rdx,%rdx,4), %rax
0000000000305f67	leaq	0x14(,%rax,4), %rsi
0000000000305f6f	movq	%r15, %rdi
0000000000305f72	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000305f77	movq	-0x58(%rbp), %r14
0000000000305f7b	movq	%r15, 0xd8(%r14)
0000000000305f82	leaq	(,%rbx,4), %rax
0000000000305f8a	leaq	(%rax,%rax,4), %rdx
0000000000305f8e	movq	%r15, %rdi
0000000000305f91	movq	%r13, %rsi
0000000000305f94	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000305f99	movl	%ebx, %eax
0000000000305f9b	testq	%r13, %r13
0000000000305f9e	je	0x305fbd
0000000000305fa0	movq	%r13, %rdi
0000000000305fa3	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000305fa8	movl	0xd0(%r14), %eax
0000000000305faf	movq	0xd8(%r14), %r15
0000000000305fb6	jmp	0x305fbd
0000000000305fb8	movq	%r13, %r15
0000000000305fbb	movl	%ebx, %eax
0000000000305fbd	leaq	(,%rbx,4), %rcx
0000000000305fc5	leaq	(%rcx,%rcx,4), %r14
0000000000305fc9	leaq	(%r15,%r14), %rdi
0000000000305fcd	addq	$0x14, %rdi
0000000000305fd1	addq	%r14, %r15
0000000000305fd4	subl	%ebx, %eax
0000000000305fd6	shlq	$0x2, %rax
0000000000305fda	leaq	(%rax,%rax,4), %rdx
0000000000305fde	movq	%r15, %rsi
0000000000305fe1	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000305fe6	movq	-0x58(%rbp), %rax
0000000000305fea	movq	0xd8(%rax), %rax
0000000000305ff1	movl	$0x0, (%rax,%r14)
0000000000305ff9	movaps	-0xb0(%rbp), %xmm0
0000000000306000	movups	%xmm0, 0x4(%rax,%r14)
0000000000306006	movq	-0x58(%rbp), %r14
000000000030600a	incl	0xd0(%r14)
0000000000306011	movq	-0x70(%rbp), %rax
0000000000306015	movsd	0x14(%rax), %xmm6
000000000030601a	movsd	0xc(%rax), %xmm5
000000000030601f	movaps	%xmm5, %xmm1
0000000000306022	minps	%xmm6, %xmm1
0000000000306025	movsd	0x4(%rax), %xmm3
000000000030602a	movss	0x8(%rax), %xmm4
000000000030602f	movaps	%xmm3, %xmm2
0000000000306032	insertps	$0x10, %xmm4, %xmm2             ## xmm2 = xmm2[0],xmm4[0],xmm2[2,3]
0000000000306038	movaps	%xmm1, %xmm0
000000000030603b	cmpltps	%xmm2, %xmm0
000000000030603f	movaps	%xmm3, %xmm2
0000000000306042	blendvps	%xmm0, %xmm1, %xmm2
0000000000306047	minps	-0x90(%rbp), %xmm2
000000000030604e	movaps	%xmm5, %xmm1
0000000000306051	maxss	%xmm6, %xmm1
0000000000306055	movaps	%xmm6, -0x180(%rbp)
000000000030605c	insertps	$0x50, %xmm6, %xmm3             ## xmm3 = xmm3[0],xmm6[1],xmm3[2,3]
0000000000306062	movaps	%xmm5, -0x150(%rbp)
0000000000306069	blendps	$0xe, %xmm5, %xmm1              ## xmm1 = xmm1[0],xmm5[1,2,3]
000000000030606f	maxps	%xmm3, %xmm1
0000000000306072	movaps	-0xa0(%rbp), %xmm3
0000000000306079	movaps	%xmm3, %xmm0
000000000030607c	insertps	$0x10, %xmm4, %xmm0             ## xmm0 = xmm0[0],xmm4[0],xmm0[2,3]
0000000000306082	maxps	%xmm0, %xmm1
0000000000306085	movl	$0x3, %eax
000000000030608a	movl	$0x0, -0x118(%rbp)
0000000000306094	movshdup	%xmm3, %xmm0                    ## xmm0 = xmm3[1,1,3,3]
0000000000306098	movshdup	%xmm1, %xmm3                    ## xmm3 = xmm1[1,1,3,3]
000000000030609c	maxss	%xmm0, %xmm3
00000000003060a0	movq	-0x78(%rbp), %rcx
00000000003060a4	addl	%eax, %ecx
00000000003060a6	movq	%rcx, -0x78(%rbp)
00000000003060aa	insertps	$0x10, %xmm3, %xmm1             ## xmm1 = xmm1[0],xmm3[0],xmm1[2,3]
00000000003060b0	movaps	%xmm1, %xmm3
00000000003060b3	movaps	%xmm2, -0x90(%rbp)
00000000003060ba	jmp	0x303d00
00000000003060bf	movq	-0x140(%rbp), %rbx
00000000003060c6	movq	-0x138(%rbp), %rax
00000000003060cd	cmpq	%rax, %rbx
00000000003060d0	jne	0x306100
00000000003060d2	jmp	0x306147
00000000003060d4	movaps	0x4054c5(%rip), %xmm0
00000000003060db	movaps	%xmm0, -0x90(%rbp)
00000000003060e2	movaps	0x4054c7(%rip), %xmm3
00000000003060e9	movq	$0x0, -0x78(%rbp)
00000000003060f1	movq	%rax, %rbx
00000000003060f4	movq	-0x158(%rbp), %rax
00000000003060fb	cmpq	%rax, %rbx
00000000003060fe	je	0x306147
0000000000306100	movaps	%xmm3, -0xa0(%rbp)
0000000000306107	jmp	0x306120
0000000000306109	nopl	(%rax)
0000000000306110	movq	$0x0, (%rbx)
0000000000306117	addq	$0x8, %rbx
000000000030611b	cmpq	%rax, %rbx
000000000030611e	je	0x306147
0000000000306120	movq	(%rbx), %r14
0000000000306123	testq	%r14, %r14
0000000000306126	je	0x306110
0000000000306128	movq	%r14, %rdi
000000000030612b	movq	%rax, %r15
000000000030612e	callq	__ZN15OZQuadraticPathD1Ev       ## OZQuadraticPath::~OZQuadraticPath()
0000000000306133	movq	%r14, %rdi
0000000000306136	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000030613b	movaps	-0xa0(%rbp), %xmm3
0000000000306142	movq	%r15, %rax
0000000000306145	jmp	0x306110
0000000000306147	cvtps2pd	%xmm3, %xmm0
000000000030614a	movaps	-0x90(%rbp), %xmm2
0000000000306151	subps	%xmm2, %xmm3
0000000000306154	cvtps2pd	%xmm3, %xmm1
0000000000306157	mulpd	0x405461(%rip), %xmm1
000000000030615f	cvtps2pd	%xmm2, %xmm2
0000000000306162	subpd	%xmm1, %xmm2
0000000000306166	cvtpd2ps	%xmm2, %xmm2
000000000030616a	addpd	%xmm0, %xmm1
000000000030616e	cvtpd2ps	%xmm1, %xmm1
0000000000306172	cvtps2pd	%xmm2, %xmm0
0000000000306175	movq	-0x58(%rbp), %r14
0000000000306179	movups	%xmm0, 0x38(%r14)
000000000030617e	movapd	%xmm1, -0xa0(%rbp)
0000000000306186	movapd	%xmm1, %xmm0
000000000030618a	movapd	%xmm2, -0x70(%rbp)
000000000030618f	subps	%xmm2, %xmm0
0000000000306192	cvtps2pd	%xmm0, %xmm0
0000000000306195	movups	%xmm0, 0x48(%r14)
000000000030619a	leaq	0x90(%r14), %rax
00000000003061a1	movq	%rax, -0xb8(%rbp)
00000000003061a8	movl	0x90(%r14), %ebx
00000000003061af	movl	%ebx, %edx
00000000003061b1	cmpl	0x94(%r14), %ebx
00000000003061b8	jne	0x306228
00000000003061ba	movq	0x98(%r14), %r15
00000000003061c1	movq	%r14, %rax
00000000003061c4	leal	(%rbx,%rbx), %r14d
00000000003061c8	movl	%r14d, 0x94(%rax)
00000000003061cf	leaq	(,%r14,8), %r13
00000000003061d7	movq	%r13, %rdi
00000000003061da	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003061df	movq	%rax, %r12
00000000003061e2	testl	%r14d, %r14d
00000000003061e5	je	0x3061f2
00000000003061e7	movq	%r12, %rdi
00000000003061ea	movq	%r13, %rsi
00000000003061ed	callq	0x6dfcba                        ## symbol stub for: ___bzero
00000000003061f2	movq	-0x58(%rbp), %r14
00000000003061f6	movq	%r12, 0x98(%r14)
00000000003061fd	leaq	(,%rbx,8), %rdx
0000000000306205	movq	%r12, %rdi
0000000000306208	movq	%r15, %rsi
000000000030620b	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000306210	movl	%ebx, %edx
0000000000306212	testq	%r15, %r15
0000000000306215	je	0x306228
0000000000306217	movq	%r15, %rdi
000000000030621a	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030621f	movq	-0xb8(%rbp), %rax
0000000000306226	movl	(%rax), %edx
0000000000306228	movq	0x98(%r14), %rax
000000000030622f	leaq	(%rax,%rbx,8), %rsi
0000000000306233	leaq	(%rax,%rbx,8), %rdi
0000000000306237	addq	$0x8, %rdi
000000000030623b	subl	%ebx, %edx
000000000030623d	shlq	$0x3, %rdx
0000000000306241	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000306246	movq	0x98(%r14), %rax
000000000030624d	movaps	-0x70(%rbp), %xmm0
0000000000306251	movlps	%xmm0, (%rax,%rbx,8)
0000000000306255	movl	0x90(%r14), %ebx
000000000030625c	incl	%ebx
000000000030625e	movl	%ebx, 0x90(%r14)
0000000000306265	movq	0x98(%r14), %r15
000000000030626c	cmpl	0x94(%r14), %ebx
0000000000306273	jne	0x3062e3
0000000000306275	movq	%r14, %rax
0000000000306278	leal	(%rbx,%rbx), %r14d
000000000030627c	movl	%r14d, 0x94(%rax)
0000000000306283	leaq	(,%r14,8), %r13
000000000030628b	movq	%r13, %rdi
000000000030628e	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000306293	movq	%rax, %r12
0000000000306296	testl	%r14d, %r14d
0000000000306299	je	0x3062a6
000000000030629b	movq	%r12, %rdi
000000000030629e	movq	%r13, %rsi
00000000003062a1	callq	0x6dfcba                        ## symbol stub for: ___bzero
00000000003062a6	movq	-0x58(%rbp), %r14
00000000003062aa	movq	%r12, 0x98(%r14)
00000000003062b1	leaq	(,%rbx,8), %rdx
00000000003062b9	movq	%r12, %rdi
00000000003062bc	movq	%r15, %rsi
00000000003062bf	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003062c4	movl	%ebx, %edx
00000000003062c6	testq	%r15, %r15
00000000003062c9	je	0x3062e8
00000000003062cb	movq	%r15, %rdi
00000000003062ce	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003062d3	movl	0x90(%r14), %edx
00000000003062da	movq	0x98(%r14), %r12
00000000003062e1	jmp	0x3062e8
00000000003062e3	movq	%r15, %r12
00000000003062e6	movl	%ebx, %edx
00000000003062e8	leaq	(%r12,%rbx,8), %rsi
00000000003062ec	leaq	(%r12,%rbx,8), %rdi
00000000003062f0	addq	$0x8, %rdi
00000000003062f4	subl	%ebx, %edx
00000000003062f6	shlq	$0x3, %rdx
00000000003062fa	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003062ff	movq	0x98(%r14), %rax
0000000000306306	movaps	-0x70(%rbp), %xmm0
000000000030630a	movss	%xmm0, (%rax,%rbx,8)
000000000030630f	movshdup	-0xa0(%rbp), %xmm0              ## xmm0 = mem[1,1,3,3]
0000000000306317	movaps	%xmm0, -0x90(%rbp)
000000000030631e	movss	%xmm0, 0x4(%rax,%rbx,8)
0000000000306324	movl	0x90(%r14), %ebx
000000000030632b	incl	%ebx
000000000030632d	movl	%ebx, 0x90(%r14)
0000000000306334	movq	0x98(%r14), %r15
000000000030633b	cmpl	0x94(%r14), %ebx
0000000000306342	jne	0x3063b2
0000000000306344	movq	%r14, %rax
0000000000306347	leal	(%rbx,%rbx), %r14d
000000000030634b	movl	%r14d, 0x94(%rax)
0000000000306352	leaq	(,%r14,8), %r13
000000000030635a	movq	%r13, %rdi
000000000030635d	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000306362	movq	%rax, %r12
0000000000306365	testl	%r14d, %r14d
0000000000306368	je	0x306375
000000000030636a	movq	%r12, %rdi
000000000030636d	movq	%r13, %rsi
0000000000306370	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000306375	movq	-0x58(%rbp), %r14
0000000000306379	movq	%r12, 0x98(%r14)
0000000000306380	leaq	(,%rbx,8), %rdx
0000000000306388	movq	%r12, %rdi
000000000030638b	movq	%r15, %rsi
000000000030638e	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000306393	movl	%ebx, %edx
0000000000306395	testq	%r15, %r15
0000000000306398	je	0x3063b7
000000000030639a	movq	%r15, %rdi
000000000030639d	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003063a2	movl	0x90(%r14), %edx
00000000003063a9	movq	0x98(%r14), %r12
00000000003063b0	jmp	0x3063b7
00000000003063b2	movq	%r15, %r12
00000000003063b5	movl	%ebx, %edx
00000000003063b7	leaq	(%r12,%rbx,8), %rsi
00000000003063bb	leaq	(%r12,%rbx,8), %rdi
00000000003063bf	addq	$0x8, %rdi
00000000003063c3	subl	%ebx, %edx
00000000003063c5	shlq	$0x3, %rdx
00000000003063c9	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003063ce	movq	0x98(%r14), %rax
00000000003063d5	movaps	-0xa0(%rbp), %xmm0
00000000003063dc	movlps	%xmm0, (%rax,%rbx,8)
00000000003063e0	movl	0x90(%r14), %ebx
00000000003063e7	incl	%ebx
00000000003063e9	movl	%ebx, 0x90(%r14)
00000000003063f0	movq	0x98(%r14), %r15
00000000003063f7	cmpl	0x94(%r14), %ebx
00000000003063fe	jne	0x30646e
0000000000306400	movq	%r14, %rax
0000000000306403	leal	(%rbx,%rbx), %r14d
0000000000306407	movl	%r14d, 0x94(%rax)
000000000030640e	leaq	(,%r14,8), %r13
0000000000306416	movq	%r13, %rdi
0000000000306419	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030641e	movq	%rax, %r12
0000000000306421	testl	%r14d, %r14d
0000000000306424	je	0x306431
0000000000306426	movq	%r12, %rdi
0000000000306429	movq	%r13, %rsi
000000000030642c	callq	0x6dfcba                        ## symbol stub for: ___bzero
0000000000306431	movq	-0x58(%rbp), %r14
0000000000306435	movq	%r12, 0x98(%r14)
000000000030643c	leaq	(,%rbx,8), %rdx
0000000000306444	movq	%r12, %rdi
0000000000306447	movq	%r15, %rsi
000000000030644a	callq	0x6dff8a                        ## symbol stub for: _memcpy
000000000030644f	movl	%ebx, %edx
0000000000306451	testq	%r15, %r15
0000000000306454	je	0x306473
0000000000306456	movq	%r15, %rdi
0000000000306459	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030645e	movl	0x90(%r14), %edx
0000000000306465	movq	0x98(%r14), %r12
000000000030646c	jmp	0x306473
000000000030646e	movq	%r15, %r12
0000000000306471	movl	%ebx, %edx
0000000000306473	leaq	(%r12,%rbx,8), %rsi
0000000000306477	leaq	(%r12,%rbx,8), %rdi
000000000030647b	addq	$0x8, %rdi
000000000030647f	subl	%ebx, %edx
0000000000306481	shlq	$0x3, %rdx
0000000000306485	callq	0x6dff90                        ## symbol stub for: _memmove
000000000030648a	movq	0x98(%r14), %rax
0000000000306491	movaps	-0xa0(%rbp), %xmm0
0000000000306498	movss	%xmm0, (%rax,%rbx,8)
000000000030649d	movshdup	-0x70(%rbp), %xmm0              ## xmm0 = mem[1,1,3,3]
00000000003064a2	movaps	%xmm0, -0x100(%rbp)
00000000003064a9	movss	%xmm0, 0x4(%rax,%rbx,8)
00000000003064af	incl	0x90(%r14)
00000000003064b6	movl	0x80(%r14), %ebx
00000000003064bd	movl	%ebx, %edx
00000000003064bf	cmpl	0x84(%r14), %ebx
00000000003064c6	jne	0x306512
00000000003064c8	movq	0x88(%r14), %r15
00000000003064cf	leal	(%rbx,%rbx), %edi
00000000003064d2	movl	%edi, 0x84(%r14)
00000000003064d9	shlq	$0x2, %rdi
00000000003064dd	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003064e2	movq	%rax, 0x88(%r14)
00000000003064e9	leaq	(,%rbx,4), %rdx
00000000003064f1	movq	%rax, %rdi
00000000003064f4	movq	%r15, %rsi
00000000003064f7	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003064fc	movl	%ebx, %edx
00000000003064fe	testq	%r15, %r15
0000000000306501	je	0x306512
0000000000306503	movq	%r15, %rdi
0000000000306506	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030650b	movl	0x80(%r14), %edx
0000000000306512	movq	0x88(%r14), %rax
0000000000306519	leaq	(%rax,%rbx,4), %rsi
000000000030651d	leaq	(%rax,%rbx,4), %rdi
0000000000306521	addq	$0x4, %rdi
0000000000306525	subl	%ebx, %edx
0000000000306527	shlq	$0x2, %rdx
000000000030652b	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000306530	movq	0x88(%r14), %r15
0000000000306537	movaps	-0x70(%rbp), %xmm0
000000000030653b	movss	%xmm0, (%r15,%rbx,4)
0000000000306541	movl	0x80(%r14), %ebx
0000000000306548	incl	%ebx
000000000030654a	movl	%ebx, 0x80(%r14)
0000000000306551	cmpl	0x84(%r14), %ebx
0000000000306558	jne	0x30659f
000000000030655a	leal	(%rbx,%rbx), %edi
000000000030655d	movl	%edi, 0x84(%r14)
0000000000306564	shlq	$0x2, %rdi
0000000000306568	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030656d	movq	%rax, 0x88(%r14)
0000000000306574	leaq	(,%rbx,4), %rdx
000000000030657c	movq	%rax, %rdi
000000000030657f	movq	%r15, %rsi
0000000000306582	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000306587	movq	%r15, %rdi
000000000030658a	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030658f	movl	0x80(%r14), %edx
0000000000306596	movq	0x88(%r14), %r15
000000000030659d	jmp	0x3065a1
000000000030659f	movl	%ebx, %edx
00000000003065a1	leaq	(%r15,%rbx,4), %rsi
00000000003065a5	leaq	(%r15,%rbx,4), %rdi
00000000003065a9	addq	$0x4, %rdi
00000000003065ad	subl	%ebx, %edx
00000000003065af	shlq	$0x2, %rdx
00000000003065b3	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003065b8	movq	0x88(%r14), %r15
00000000003065bf	movaps	-0x100(%rbp), %xmm0
00000000003065c6	movss	%xmm0, (%r15,%rbx,4)
00000000003065cc	movl	0x80(%r14), %ebx
00000000003065d3	incl	%ebx
00000000003065d5	movl	%ebx, 0x80(%r14)
00000000003065dc	cmpl	0x84(%r14), %ebx
00000000003065e3	jne	0x30662a
00000000003065e5	leal	(%rbx,%rbx), %edi
00000000003065e8	movl	%edi, 0x84(%r14)
00000000003065ef	shlq	$0x2, %rdi
00000000003065f3	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003065f8	movq	%rax, 0x88(%r14)
00000000003065ff	leaq	(,%rbx,4), %rdx
0000000000306607	movq	%rax, %rdi
000000000030660a	movq	%r15, %rsi
000000000030660d	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000306612	movq	%r15, %rdi
0000000000306615	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030661a	movl	0x80(%r14), %edx
0000000000306621	movq	0x88(%r14), %r15
0000000000306628	jmp	0x30662c
000000000030662a	movl	%ebx, %edx
000000000030662c	leaq	(%r15,%rbx,4), %rsi
0000000000306630	leaq	(%r15,%rbx,4), %rdi
0000000000306634	addq	$0x4, %rdi
0000000000306638	subl	%ebx, %edx
000000000030663a	shlq	$0x2, %rdx
000000000030663e	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000306643	movq	0x88(%r14), %r15
000000000030664a	movaps	-0x70(%rbp), %xmm0
000000000030664e	movss	%xmm0, (%r15,%rbx,4)
0000000000306654	movl	0x80(%r14), %ebx
000000000030665b	incl	%ebx
000000000030665d	movl	%ebx, 0x80(%r14)
0000000000306664	cmpl	0x84(%r14), %ebx
000000000030666b	jne	0x3066b2
000000000030666d	leal	(%rbx,%rbx), %edi
0000000000306670	movl	%edi, 0x84(%r14)
0000000000306677	shlq	$0x2, %rdi
000000000030667b	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000306680	movq	%rax, 0x88(%r14)
0000000000306687	leaq	(,%rbx,4), %rdx
000000000030668f	movq	%rax, %rdi
0000000000306692	movq	%r15, %rsi
0000000000306695	callq	0x6dff8a                        ## symbol stub for: _memcpy
000000000030669a	movq	%r15, %rdi
000000000030669d	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003066a2	movl	0x80(%r14), %edx
00000000003066a9	movq	0x88(%r14), %r15
00000000003066b0	jmp	0x3066b4
00000000003066b2	movl	%ebx, %edx
00000000003066b4	leaq	(%r15,%rbx,4), %rsi
00000000003066b8	leaq	(%r15,%rbx,4), %rdi
00000000003066bc	addq	$0x4, %rdi
00000000003066c0	subl	%ebx, %edx
00000000003066c2	shlq	$0x2, %rdx
00000000003066c6	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003066cb	movq	0x88(%r14), %r15
00000000003066d2	movaps	-0x90(%rbp), %xmm0
00000000003066d9	movss	%xmm0, (%r15,%rbx,4)
00000000003066df	movl	0x80(%r14), %ebx
00000000003066e6	incl	%ebx
00000000003066e8	movl	%ebx, 0x80(%r14)
00000000003066ef	cmpl	0x84(%r14), %ebx
00000000003066f6	jne	0x30673d
00000000003066f8	leal	(%rbx,%rbx), %edi
00000000003066fb	movl	%edi, 0x84(%r14)
0000000000306702	shlq	$0x2, %rdi
0000000000306706	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030670b	movq	%rax, 0x88(%r14)
0000000000306712	leaq	(,%rbx,4), %rdx
000000000030671a	movq	%rax, %rdi
000000000030671d	movq	%r15, %rsi
0000000000306720	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000306725	movq	%r15, %rdi
0000000000306728	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000030672d	movl	0x80(%r14), %edx
0000000000306734	movq	0x88(%r14), %r15
000000000030673b	jmp	0x30673f
000000000030673d	movl	%ebx, %edx
000000000030673f	leaq	(%r15,%rbx,4), %rsi
0000000000306743	leaq	(%r15,%rbx,4), %rdi
0000000000306747	addq	$0x4, %rdi
000000000030674b	subl	%ebx, %edx
000000000030674d	shlq	$0x2, %rdx
0000000000306751	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000306756	movq	0x88(%r14), %r15
000000000030675d	movaps	-0xa0(%rbp), %xmm0
0000000000306764	movss	%xmm0, (%r15,%rbx,4)
000000000030676a	movl	0x80(%r14), %ebx
0000000000306771	incl	%ebx
0000000000306773	movl	%ebx, 0x80(%r14)
000000000030677a	cmpl	0x84(%r14), %ebx
0000000000306781	jne	0x3067c8
0000000000306783	leal	(%rbx,%rbx), %edi
0000000000306786	movl	%edi, 0x84(%r14)
000000000030678d	shlq	$0x2, %rdi
0000000000306791	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000306796	movq	%rax, 0x88(%r14)
000000000030679d	leaq	(,%rbx,4), %rdx
00000000003067a5	movq	%rax, %rdi
00000000003067a8	movq	%r15, %rsi
00000000003067ab	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003067b0	movq	%r15, %rdi
00000000003067b3	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003067b8	movl	0x80(%r14), %edx
00000000003067bf	movq	0x88(%r14), %r15
00000000003067c6	jmp	0x3067ca
00000000003067c8	movl	%ebx, %edx
00000000003067ca	leaq	(%r15,%rbx,4), %rsi
00000000003067ce	leaq	(%r15,%rbx,4), %rdi
00000000003067d2	addq	$0x4, %rdi
00000000003067d6	subl	%ebx, %edx
00000000003067d8	shlq	$0x2, %rdx
00000000003067dc	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003067e1	movq	0x88(%r14), %r15
00000000003067e8	movaps	-0x90(%rbp), %xmm0
00000000003067ef	movss	%xmm0, (%r15,%rbx,4)
00000000003067f5	movl	0x80(%r14), %ebx
00000000003067fc	incl	%ebx
00000000003067fe	movl	%ebx, 0x80(%r14)
0000000000306805	cmpl	0x84(%r14), %ebx
000000000030680c	jne	0x306853
000000000030680e	leal	(%rbx,%rbx), %edi
0000000000306811	movl	%edi, 0x84(%r14)
0000000000306818	shlq	$0x2, %rdi
000000000030681c	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000306821	movq	%rax, 0x88(%r14)
0000000000306828	leaq	(,%rbx,4), %rdx
0000000000306830	movq	%rax, %rdi
0000000000306833	movq	%r15, %rsi
0000000000306836	callq	0x6dff8a                        ## symbol stub for: _memcpy
000000000030683b	movq	%r15, %rdi
000000000030683e	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000306843	movl	0x80(%r14), %edx
000000000030684a	movq	0x88(%r14), %r15
0000000000306851	jmp	0x306855
0000000000306853	movl	%ebx, %edx
0000000000306855	leaq	(%r15,%rbx,4), %rsi
0000000000306859	leaq	(%r15,%rbx,4), %rdi
000000000030685d	addq	$0x4, %rdi
0000000000306861	subl	%ebx, %edx
0000000000306863	shlq	$0x2, %rdx
0000000000306867	callq	0x6dff90                        ## symbol stub for: _memmove
000000000030686c	movq	0x88(%r14), %r15
0000000000306873	movaps	-0xa0(%rbp), %xmm0
000000000030687a	movss	%xmm0, (%r15,%rbx,4)
0000000000306880	movl	0x80(%r14), %ebx
0000000000306887	incl	%ebx
0000000000306889	movl	%ebx, 0x80(%r14)
0000000000306890	cmpl	0x84(%r14), %ebx
0000000000306897	jne	0x3068de
0000000000306899	leal	(%rbx,%rbx), %edi
000000000030689c	movl	%edi, 0x84(%r14)
00000000003068a3	shlq	$0x2, %rdi
00000000003068a7	callq	0x6dfc96                        ## symbol stub for: __Znam
00000000003068ac	movq	%rax, 0x88(%r14)
00000000003068b3	leaq	(,%rbx,4), %rdx
00000000003068bb	movq	%rax, %rdi
00000000003068be	movq	%r15, %rsi
00000000003068c1	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003068c6	movq	%r15, %rdi
00000000003068c9	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000003068ce	movl	0x80(%r14), %edx
00000000003068d5	movq	0x88(%r14), %r15
00000000003068dc	jmp	0x3068e0
00000000003068de	movl	%ebx, %edx
00000000003068e0	leaq	(%r15,%rbx,4), %rsi
00000000003068e4	leaq	(%r15,%rbx,4), %rdi
00000000003068e8	addq	$0x4, %rdi
00000000003068ec	subl	%ebx, %edx
00000000003068ee	shlq	$0x2, %rdx
00000000003068f2	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003068f7	movq	0x88(%r14), %rax
00000000003068fe	movaps	-0x100(%rbp), %xmm0
0000000000306905	movss	%xmm0, (%rax,%rbx,4)
000000000030690a	incl	0x80(%r14)
0000000000306911	leaq	0xa0(%r14), %r15
0000000000306918	movq	%r14, %r12
000000000030691b	movl	0xa0(%r14), %r14d
0000000000306922	movl	%r14d, %edx
0000000000306925	cmpl	0xa4(%r12), %r14d
000000000030692d	jne	0x30697a
000000000030692f	movq	0xa8(%r12), %rbx
0000000000306937	leal	(%r14,%r14), %edi
000000000030693b	movl	%edi, 0xa4(%r12)
0000000000306943	shlq	$0x3, %rdi
0000000000306947	callq	0x6dfc96                        ## symbol stub for: __Znam
000000000030694c	movq	%rax, 0xa8(%r12)
0000000000306954	leaq	(,%r14,8), %rdx
000000000030695c	movq	%rax, %rdi
000000000030695f	movq	%rbx, %rsi
0000000000306962	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000306967	movl	%r14d, %edx
000000000030696a	testq	%rbx, %rbx
000000000030696d	je	0x30697a
000000000030696f	movq	%rbx, %rdi
0000000000306972	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000306977	movl	(%r15), %edx
000000000030697a	movq	%r15, -0xa0(%rbp)
0000000000306981	movq	-0x78(%rbp), %r15
0000000000306985	leal	0x1(%r15), %ebx
0000000000306989	movq	0xa8(%r12), %rax
0000000000306991	leaq	(%rax,%r14,8), %rsi
0000000000306995	leaq	(%rax,%r14,8), %rdi
0000000000306999	addq	$0x8, %rdi
000000000030699d	subl	%r14d, %edx
00000000003069a0	shlq	$0x3, %rdx
00000000003069a4	callq	0x6dff90                        ## symbol stub for: _memmove
00000000003069a9	movq	0xa8(%r12), %rax
00000000003069b1	movl	%ebx, %ebx
00000000003069b3	movq	%rbx, %rcx
00000000003069b6	shlq	$0x20, %rcx
00000000003069ba	movl	%r15d, %edx
00000000003069bd	movq	%rdx, -0x70(%rbp)
00000000003069c1	orq	%rdx, %rcx
00000000003069c4	movq	%rcx, (%rax,%r14,8)
00000000003069c8	movl	0xa0(%r12), %r14d
00000000003069d0	incl	%r14d
00000000003069d3	movl	%r14d, 0xa0(%r12)
00000000003069db	movq	0xa8(%r12), %r15
00000000003069e3	cmpl	0xa4(%r12), %r14d
00000000003069eb	jne	0x306a42
00000000003069ed	leal	(%r14,%r14), %edi
00000000003069f1	movl	%edi, 0xa4(%r12)
00000000003069f9	shlq	$0x3, %rdi
00000000003069fd	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000306a02	movq	%rax, %r13
0000000000306a05	movq	%rax, 0xa8(%r12)
0000000000306a0d	leaq	(,%r14,8), %rdx
0000000000306a15	movq	%rax, %rdi
0000000000306a18	movq	%r15, %rsi
0000000000306a1b	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000306a20	movl	%r14d, %edx
0000000000306a23	testq	%r15, %r15
0000000000306a26	je	0x306a48
0000000000306a28	movq	%r15, %rdi
0000000000306a2b	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000306a30	movl	0xa0(%r12), %edx
0000000000306a38	movq	0xa8(%r12), %r13
0000000000306a40	jmp	0x306a48
0000000000306a42	movq	%r15, %r13
0000000000306a45	movl	%r14d, %edx
0000000000306a48	movq	-0x78(%rbp), %rax
0000000000306a4c	leal	0x2(%rax), %r15d
0000000000306a50	leaq	(,%r14,8), %rsi
0000000000306a58	addq	%r13, %rsi
0000000000306a5b	leaq	0x8(,%r14,8), %rdi
0000000000306a63	addq	%r13, %rdi
0000000000306a66	subl	%r14d, %edx
0000000000306a69	shlq	$0x3, %rdx
0000000000306a6d	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000306a72	movq	0xa8(%r12), %rax
0000000000306a7a	movl	%r15d, %r15d
0000000000306a7d	movq	%r15, %rcx
0000000000306a80	shlq	$0x20, %rcx
0000000000306a84	orq	%rbx, %rcx
0000000000306a87	movq	%rcx, (%rax,%r14,8)
0000000000306a8b	movl	0xa0(%r12), %r14d
0000000000306a93	incl	%r14d
0000000000306a96	movl	%r14d, 0xa0(%r12)
0000000000306a9e	movq	0xa8(%r12), %rbx
0000000000306aa6	cmpl	0xa4(%r12), %r14d
0000000000306aae	jne	0x306b05
0000000000306ab0	leal	(%r14,%r14), %edi
0000000000306ab4	movl	%edi, 0xa4(%r12)
0000000000306abc	shlq	$0x3, %rdi
0000000000306ac0	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000306ac5	movq	%rax, %r13
0000000000306ac8	movq	%rax, 0xa8(%r12)
0000000000306ad0	leaq	(,%r14,8), %rdx
0000000000306ad8	movq	%rax, %rdi
0000000000306adb	movq	%rbx, %rsi
0000000000306ade	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000306ae3	movl	%r14d, %edx
0000000000306ae6	testq	%rbx, %rbx
0000000000306ae9	je	0x306b0b
0000000000306aeb	movq	%rbx, %rdi
0000000000306aee	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000306af3	movl	0xa0(%r12), %edx
0000000000306afb	movq	0xa8(%r12), %r13
0000000000306b03	jmp	0x306b0b
0000000000306b05	movq	%rbx, %r13
0000000000306b08	movl	%r14d, %edx
0000000000306b0b	movq	-0x78(%rbp), %rbx
0000000000306b0f	addl	$0x3, %ebx
0000000000306b12	leaq	(,%r14,8), %rsi
0000000000306b1a	addq	%r13, %rsi
0000000000306b1d	leaq	0x8(,%r14,8), %rdi
0000000000306b25	addq	%r13, %rdi
0000000000306b28	subl	%r14d, %edx
0000000000306b2b	shlq	$0x3, %rdx
0000000000306b2f	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000306b34	movq	0xa8(%r12), %rax
0000000000306b3c	movl	%ebx, %ebx
0000000000306b3e	movq	%rbx, %rcx
0000000000306b41	shlq	$0x20, %rcx
0000000000306b45	orq	%r15, %rcx
0000000000306b48	movq	%rcx, (%rax,%r14,8)
0000000000306b4c	movl	0xa0(%r12), %r14d
0000000000306b54	incl	%r14d
0000000000306b57	movl	%r14d, 0xa0(%r12)
0000000000306b5f	movq	0xa8(%r12), %r15
0000000000306b67	cmpl	0xa4(%r12), %r14d
0000000000306b6f	jne	0x306bc6
0000000000306b71	leal	(%r14,%r14), %edi
0000000000306b75	movl	%edi, 0xa4(%r12)
0000000000306b7d	shlq	$0x3, %rdi
0000000000306b81	callq	0x6dfc96                        ## symbol stub for: __Znam
0000000000306b86	movq	%rax, %r13
0000000000306b89	movq	%rax, 0xa8(%r12)
0000000000306b91	leaq	(,%r14,8), %rdx
0000000000306b99	movq	%rax, %rdi
0000000000306b9c	movq	%r15, %rsi
0000000000306b9f	callq	0x6dff8a                        ## symbol stub for: _memcpy
0000000000306ba4	movl	%r14d, %edx
0000000000306ba7	testq	%r15, %r15
0000000000306baa	je	0x306bcc
0000000000306bac	movq	%r15, %rdi
0000000000306baf	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
0000000000306bb4	movl	0xa0(%r12), %edx
0000000000306bbc	movq	0xa8(%r12), %r13
0000000000306bc4	jmp	0x306bcc
0000000000306bc6	movq	%r15, %r13
0000000000306bc9	movl	%r14d, %edx
0000000000306bcc	leaq	(,%r14,8), %rsi
0000000000306bd4	addq	%r13, %rsi
0000000000306bd7	leaq	0x8(,%r14,8), %rdi
0000000000306bdf	addq	%r13, %rdi
0000000000306be2	subl	%r14d, %edx
0000000000306be5	shlq	$0x3, %rdx
0000000000306be9	callq	0x6dff90                        ## symbol stub for: _memmove
0000000000306bee	movq	0xa8(%r12), %rax
0000000000306bf6	movq	-0x70(%rbp), %rcx
0000000000306bfa	shlq	$0x20, %rcx
0000000000306bfe	orq	%rbx, %rcx
0000000000306c01	movq	%rcx, (%rax,%r14,8)
0000000000306c05	incl	0xa0(%r12)
0000000000306c0d	leaq	-0x230(%rbp), %rdi
0000000000306c14	callq	0x6dd43a                        ## symbol stub for: __ZN10PCDelaunayC1Ev
0000000000306c19	movq	%r12, %r14
0000000000306c1c	leaq	-0x230(%rbp), %rdi
0000000000306c23	movq	-0xb8(%rbp), %rsi
0000000000306c2a	movq	-0xa0(%rbp), %rdx
0000000000306c31	callq	0x6dd42e                        ## symbol stub for: __ZN10PCDelaunay3cdtER14PCDynamicArrayI9PCVector2IfEERS0_INS_7SegmentEE
0000000000306c36	movq	%rax, %r12
0000000000306c39	cmpl	$0x0, (%rax)
0000000000306c3c	je	0x307634
0000000000306c42	leaq	0x20(%r14), %rax
0000000000306c46	movq	%rax, -0x118(%rbp)
0000000000306c4d	leaq	0x8(%r14), %rax
0000000000306c51	movq	%rax, -0xc0(%rbp)
0000000000306c58	xorl	%ebx, %ebx
0000000000306c5a	movq	%r12, -0x150(%rbp)
0000000000306c61	jmp	0x306c9b
0000000000306c63	movq	%r13, %rdi
0000000000306c66	movl	%r12d, %ecx
0000000000306c69	movq	-0xc0(%rbp), %r8
0000000000306c70	callq	__ZL15divideSTriangleRK9PCVector2IfES2_S2_N10PTTriangle4TypeERNSt3__14listIPS3_NS5_9allocatorIS7_EEEE ## divideSTriangle(PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, PTTriangle::Type, std::__1::list<PTTriangle*, std::__1::allocator<PTTriangle*>>&)
0000000000306c75	movq	-0xe0(%rbp), %rbx
0000000000306c7c	movq	%r13, %rdi
0000000000306c7f	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000306c84	movq	-0x150(%rbp), %r12
0000000000306c8b	incq	%rbx
0000000000306c8e	movl	(%r12), %eax
0000000000306c92	cmpq	%rax, %rbx
0000000000306c95	jae	0x307634
0000000000306c9b	movq	0x8(%r12), %rax
0000000000306ca0	movq	(%rax,%rbx,8), %r15
0000000000306ca4	movq	%r15, %rdi
0000000000306ca7	callq	0x6dd434                        ## symbol stub for: __ZN10PCDelaunay8Triangle7isGhostEv
0000000000306cac	testb	%al, %al
0000000000306cae	jne	0x306c8b
0000000000306cb0	movq	%rbx, -0xe0(%rbp)
0000000000306cb7	movl	$0xa8, %edi
0000000000306cbc	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000306cc1	movq	%rax, %r13
0000000000306cc4	xorps	%xmm0, %xmm0
0000000000306cc7	movups	%xmm0, (%rax)
0000000000306cca	movq	$0x0, 0x10(%rax)
0000000000306cd2	movl	$0x3, 0x1c(%rax)
0000000000306cd9	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
0000000000306ce3	movq	%rax, 0x98(%r13)
0000000000306cea	movq	%rax, 0x70(%r13)
0000000000306cee	movq	%rax, 0x48(%r13)
0000000000306cf2	movq	%rax, 0x20(%r13)
0000000000306cf6	movups	%xmm0, 0x28(%r13)
0000000000306cfb	movups	%xmm0, 0x38(%r13)
0000000000306d00	movups	%xmm0, 0x50(%r13)
0000000000306d05	movups	%xmm0, 0x60(%r13)
0000000000306d0a	movups	%xmm0, 0x78(%r13)
0000000000306d0f	movups	%xmm0, 0x88(%r13)
0000000000306d17	movl	__ZN10PTTriangle9idCounterE(%rip), %eax ## PTTriangle::idCounter
0000000000306d1d	incl	%eax
0000000000306d1f	movl	%eax, __ZN10PTTriangle9idCounterE(%rip) ## PTTriangle::idCounter
0000000000306d25	movl	%eax, 0xa0(%r13)
0000000000306d2c	movl	$0x0, 0xa4(%r13)
0000000000306d37	movq	(%r15), %rax
0000000000306d3a	movq	(%rax), %r14
0000000000306d3d	movq	%r14, (%r13)
0000000000306d41	movq	0x8(%r15), %rax
0000000000306d45	movq	(%rax), %r12
0000000000306d48	movq	%r12, 0x8(%r13)
0000000000306d4c	movq	0x10(%r15), %rax
0000000000306d50	movq	(%rax), %rbx
0000000000306d53	movq	%rbx, 0x10(%r13)
0000000000306d57	movl	$0x3, 0x18(%r13)
0000000000306d5f	movl	$0x18, %edi
0000000000306d64	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000306d69	movd	%r14d, %xmm2
0000000000306d6e	shrq	$0x20, %r14
0000000000306d72	movd	%r14d, %xmm3
0000000000306d77	movd	%r12d, %xmm4
0000000000306d7c	shrq	$0x20, %r12
0000000000306d80	movd	%r12d, %xmm6
0000000000306d85	movd	%ebx, %xmm5
0000000000306d89	movq	%r13, 0x10(%rax)
0000000000306d8d	movq	-0x118(%rbp), %rcx
0000000000306d94	movq	%rcx, 0x8(%rax)
0000000000306d98	movq	-0x58(%rbp), %r14
0000000000306d9c	movq	0x20(%r14), %rcx
0000000000306da0	movq	%rcx, (%rax)
0000000000306da3	movq	%rax, 0x8(%rcx)
0000000000306da7	movq	%rax, 0x20(%r14)
0000000000306dab	incq	0x30(%r14)
0000000000306daf	shrq	$0x20, %rbx
0000000000306db3	movd	%ebx, %xmm7
0000000000306db7	movl	0xc0(%r14), %ebx
0000000000306dbe	testq	%rbx, %rbx
0000000000306dc1	je	0x307379
0000000000306dc7	movq	0xc8(%r14), %r15
0000000000306dce	movd	%xmm2, -0x180(%rbp)
0000000000306dd6	xorps	%xmm0, %xmm0
0000000000306dd9	cvtss2sd	%xmm2, %xmm0
0000000000306ddd	movsd	%xmm0, -0x78(%rbp)
0000000000306de2	movd	%xmm3, -0x158(%rbp)
0000000000306dea	xorps	%xmm0, %xmm0
0000000000306ded	cvtss2sd	%xmm3, %xmm0
0000000000306df1	movsd	%xmm0, -0xa0(%rbp)
0000000000306df9	movd	%xmm4, -0x160(%rbp)
0000000000306e01	xorps	%xmm0, %xmm0
0000000000306e04	cvtss2sd	%xmm4, %xmm0
0000000000306e08	movsd	%xmm0, -0x90(%rbp)
0000000000306e10	movd	%xmm6, -0x168(%rbp)
0000000000306e18	xorps	%xmm0, %xmm0
0000000000306e1b	cvtss2sd	%xmm6, %xmm0
0000000000306e1f	movsd	%xmm0, -0x100(%rbp)
0000000000306e27	movd	%xmm5, -0x16c(%rbp)
0000000000306e2f	xorps	%xmm0, %xmm0
0000000000306e32	cvtss2sd	%xmm5, %xmm0
0000000000306e36	movsd	%xmm0, -0xb8(%rbp)
0000000000306e3e	movd	%xmm7, -0x164(%rbp)
0000000000306e46	xorps	%xmm0, %xmm0
0000000000306e49	cvtss2sd	%xmm7, %xmm0
0000000000306e4d	movsd	%xmm0, -0xb0(%rbp)
0000000000306e55	jmp	0x306e70
0000000000306e57	nopw	(%rax,%rax)
0000000000306e60	addq	$0xa8, %r15
0000000000306e67	decq	%rbx
0000000000306e6a	je	0x307382
0000000000306e70	movq	%r15, %rdi
0000000000306e73	movq	%r13, %rsi
0000000000306e76	callq	__ZNK10PTTriangleeqERKS_        ## PTTriangle::operator==(PTTriangle const&) const
0000000000306e7b	testb	%al, %al
0000000000306e7d	jne	0x306f1f
0000000000306e83	movsd	0x58(%r14), %xmm1
0000000000306e89	movsd	-0x78(%rbp), %xmm0
0000000000306e8e	movsd	%xmm0, -0x50(%rbp)
0000000000306e93	movsd	-0xa0(%rbp), %xmm0
0000000000306e9b	movsd	%xmm0, -0x48(%rbp)
0000000000306ea0	movq	%r15, %rdi
0000000000306ea3	leaq	-0x50(%rbp), %r12
0000000000306ea7	movq	%r12, %rsi
0000000000306eaa	movsd	%xmm1, -0x70(%rbp)
0000000000306eaf	movaps	%xmm1, %xmm0
0000000000306eb2	callq	__ZNK10PTTriangle13containsPointERK9PCVector2IdEd ## PTTriangle::containsPoint(PCVector2<double> const&, double) const
0000000000306eb7	testb	%al, %al
0000000000306eb9	je	0x306e60
0000000000306ebb	movsd	-0x90(%rbp), %xmm0
0000000000306ec3	movsd	%xmm0, -0x50(%rbp)
0000000000306ec8	movsd	-0x100(%rbp), %xmm0
0000000000306ed0	movsd	%xmm0, -0x48(%rbp)
0000000000306ed5	movq	%r15, %rdi
0000000000306ed8	movq	%r12, %rsi
0000000000306edb	movsd	-0x70(%rbp), %xmm0
0000000000306ee0	callq	__ZNK10PTTriangle13containsPointERK9PCVector2IdEd ## PTTriangle::containsPoint(PCVector2<double> const&, double) const
0000000000306ee5	testb	%al, %al
0000000000306ee7	je	0x306e60
0000000000306eed	movsd	-0xb8(%rbp), %xmm0
0000000000306ef5	movsd	%xmm0, -0x50(%rbp)
0000000000306efa	movsd	-0xb0(%rbp), %xmm0
0000000000306f02	movsd	%xmm0, -0x48(%rbp)
0000000000306f07	movq	%r15, %rdi
0000000000306f0a	movq	%r12, %rsi
0000000000306f0d	movsd	-0x70(%rbp), %xmm0
0000000000306f12	callq	__ZNK10PTTriangle13containsPointERK9PCVector2IdEd ## PTTriangle::containsPoint(PCVector2<double> const&, double) const
0000000000306f17	testb	%al, %al
0000000000306f19	je	0x306e60
0000000000306f1f	movq	(%r15), %rax
0000000000306f22	movq	%rax, (%r13)
0000000000306f26	movq	0x8(%r15), %rcx
0000000000306f2a	movq	%rcx, 0x8(%r13)
0000000000306f2e	movq	0x10(%r15), %rdx
0000000000306f32	movq	%rdx, 0x10(%r13)
0000000000306f36	movq	0x18(%r15), %rsi
0000000000306f3a	movl	0x18(%r15), %r12d
0000000000306f3e	movq	%rsi, 0x18(%r13)
0000000000306f42	movd	%eax, %xmm2
0000000000306f46	shrq	$0x20, %rax
0000000000306f4a	movd	%ecx, %xmm4
0000000000306f4e	shrq	$0x20, %rcx
0000000000306f52	movd	%edx, %xmm5
0000000000306f56	shrq	$0x20, %rdx
0000000000306f5a	movd	%eax, %xmm3
0000000000306f5e	movd	%ecx, %xmm6
0000000000306f62	movd	%edx, %xmm7
0000000000306f66	cmpq	%r13, %r15
0000000000306f69	movq	-0xe0(%rbp), %rbx
0000000000306f70	je	0x30704e
0000000000306f76	movsd	0x20(%r15), %xmm0
0000000000306f7c	movsd	%xmm0, 0x20(%r13)
0000000000306f82	movsd	0x28(%r15), %xmm0
0000000000306f88	movsd	%xmm0, 0x28(%r13)
0000000000306f8e	movsd	0x30(%r15), %xmm0
0000000000306f94	movsd	%xmm0, 0x30(%r13)
0000000000306f9a	movsd	0x38(%r15), %xmm0
0000000000306fa0	movsd	%xmm0, 0x38(%r13)
0000000000306fa6	movsd	0x40(%r15), %xmm0
0000000000306fac	movsd	%xmm0, 0x40(%r13)
0000000000306fb2	movsd	0x48(%r15), %xmm0
0000000000306fb8	movsd	%xmm0, 0x48(%r13)
0000000000306fbe	movsd	0x50(%r15), %xmm0
0000000000306fc4	movsd	%xmm0, 0x50(%r13)
0000000000306fca	movsd	0x58(%r15), %xmm0
0000000000306fd0	movsd	%xmm0, 0x58(%r13)
0000000000306fd6	movsd	0x60(%r15), %xmm0
0000000000306fdc	movsd	%xmm0, 0x60(%r13)
0000000000306fe2	movsd	0x68(%r15), %xmm0
0000000000306fe8	movsd	%xmm0, 0x68(%r13)
0000000000306fee	movsd	0x70(%r15), %xmm0
0000000000306ff4	movsd	%xmm0, 0x70(%r13)
0000000000306ffa	movsd	0x78(%r15), %xmm0
0000000000307000	movsd	%xmm0, 0x78(%r13)
0000000000307006	movsd	0x80(%r15), %xmm0
000000000030700f	movsd	%xmm0, 0x80(%r13)
0000000000307018	movsd	0x88(%r15), %xmm0
0000000000307021	movsd	%xmm0, 0x88(%r13)
000000000030702a	movsd	0x90(%r15), %xmm0
0000000000307033	movsd	%xmm0, 0x90(%r13)
000000000030703c	movsd	0x98(%r15), %xmm0
0000000000307045	movsd	%xmm0, 0x98(%r13)
000000000030704e	movq	0xa0(%r15), %rax
0000000000307055	movq	%rax, 0xa0(%r13)
000000000030705c	leal	-0x1(%r12), %eax
0000000000307061	cmpl	$0x2, %eax
0000000000307064	jae	0x3073b9
000000000030706a	nopw	(%rax,%rax)
0000000000307070	movl	0xd0(%r14), %ecx
0000000000307077	testq	%rcx, %rcx
000000000030707a	je	0x307440
0000000000307080	movq	0xd8(%r14), %rax
0000000000307087	shlq	$0x2, %rcx
000000000030708b	leaq	(%rcx,%rcx,4), %rdx
000000000030708f	xorl	%esi, %esi
0000000000307091	xorl	%r11d, %r11d
0000000000307094	xorl	%r15d, %r15d
0000000000307097	xorl	%r10d, %r10d
000000000030709a	xorl	%edi, %edi
000000000030709c	xorl	%r9d, %r9d
000000000030709f	xorl	%r8d, %r8d
00000000003070a2	jmp	0x3070c0
00000000003070a4	nopw	%cs:(%rax,%rax)
00000000003070b0	movb	$0x1, %r8b
00000000003070b3	addq	$0x14, %rsi
00000000003070b7	cmpq	%rsi, %rdx
00000000003070ba	je	0x307451
00000000003070c0	testb	$0x1, %r11b
00000000003070c4	movb	$0x1, %r11b
00000000003070c7	jne	0x307140
00000000003070c9	movss	0x4(%rax,%rsi), %xmm0
00000000003070cf	ucomiss	%xmm2, %xmm0
00000000003070d2	jne	0x307100
00000000003070d4	jp	0x307100
00000000003070d6	movss	0x8(%rax,%rsi), %xmm1
00000000003070dc	ucomiss	%xmm3, %xmm1
00000000003070df	jne	0x307100
00000000003070e1	jp	0x307100
00000000003070e3	movss	0xc(%rax,%rsi), %xmm1
00000000003070e9	ucomiss	%xmm4, %xmm1
00000000003070ec	jne	0x307100
00000000003070ee	jp	0x307100
00000000003070f0	movss	0x10(%rax,%rsi), %xmm1
00000000003070f6	ucomiss	%xmm6, %xmm1
00000000003070f9	jne	0x307100
00000000003070fb	jnp	0x307131
00000000003070fd	nopl	(%rax)
0000000000307100	ucomiss	%xmm4, %xmm0
0000000000307103	jne	0x30713c
0000000000307105	jp	0x30713c
0000000000307107	movss	0x8(%rax,%rsi), %xmm0
000000000030710d	xorl	%r11d, %r11d
0000000000307110	ucomiss	%xmm6, %xmm0
0000000000307113	jne	0x307140
0000000000307115	jp	0x307140
0000000000307117	movss	0xc(%rax,%rsi), %xmm0
000000000030711d	ucomiss	%xmm2, %xmm0
0000000000307120	jne	0x307140
0000000000307122	jp	0x307140
0000000000307124	movss	0x10(%rax,%rsi), %xmm0
000000000030712a	ucomiss	%xmm3, %xmm0
000000000030712d	jne	0x30714e
000000000030712f	jp	0x30714e
0000000000307131	movb	$0x1, %r11b
0000000000307134	testb	$0x1, %r15b
0000000000307138	jne	0x307146
000000000030713a	jmp	0x307160
000000000030713c	xorl	%r11d, %r11d
000000000030713f	nop
0000000000307140	testb	$0x1, %r15b
0000000000307144	je	0x307160
0000000000307146	movb	$0x1, %r15b
0000000000307149	jmp	0x3071d8
000000000030714e	xorl	%r11d, %r11d
0000000000307151	testb	$0x1, %r15b
0000000000307155	jne	0x307146
0000000000307157	nopw	(%rax,%rax)
0000000000307160	movss	0x4(%rax,%rsi), %xmm0
0000000000307166	ucomiss	%xmm4, %xmm0
0000000000307169	jne	0x3071a0
000000000030716b	jp	0x3071a0
000000000030716d	movss	0x8(%rax,%rsi), %xmm1
0000000000307173	ucomiss	%xmm6, %xmm1
0000000000307176	jne	0x3071a0
0000000000307178	jp	0x3071a0
000000000030717a	movss	0xc(%rax,%rsi), %xmm1
0000000000307180	ucomiss	%xmm5, %xmm1
0000000000307183	jne	0x3071a0
0000000000307185	jp	0x3071a0
0000000000307187	movss	0x10(%rax,%rsi), %xmm1
000000000030718d	ucomiss	%xmm7, %xmm1
0000000000307190	jne	0x3071a0
0000000000307192	jnp	0x307146
0000000000307194	nopw	%cs:(%rax,%rax)
00000000003071a0	ucomiss	%xmm5, %xmm0
00000000003071a3	jne	0x3071d5
00000000003071a5	jp	0x3071d5
00000000003071a7	movss	0x8(%rax,%rsi), %xmm0
00000000003071ad	xorl	%r15d, %r15d
00000000003071b0	ucomiss	%xmm7, %xmm0
00000000003071b3	jne	0x3071d8
00000000003071b5	jp	0x3071d8
00000000003071b7	movss	0xc(%rax,%rsi), %xmm0
00000000003071bd	ucomiss	%xmm4, %xmm0
00000000003071c0	jne	0x3071d8
00000000003071c2	jp	0x3071d8
00000000003071c4	movss	0x10(%rax,%rsi), %xmm0
00000000003071ca	ucomiss	%xmm6, %xmm0
00000000003071cd	jne	0x3071d5
00000000003071cf	jnp	0x307146
00000000003071d5	xorl	%r15d, %r15d
00000000003071d8	testb	$0x1, %r10b
00000000003071dc	movb	$0x1, %r10b
00000000003071df	jne	0x307260
00000000003071e5	movss	0x4(%rax,%rsi), %xmm0
00000000003071eb	ucomiss	%xmm5, %xmm0
00000000003071ee	jne	0x307220
00000000003071f0	jp	0x307220
00000000003071f2	movss	0x8(%rax,%rsi), %xmm1
00000000003071f8	ucomiss	%xmm7, %xmm1
00000000003071fb	jne	0x307220
00000000003071fd	jp	0x307220
00000000003071ff	movss	0xc(%rax,%rsi), %xmm1
0000000000307205	ucomiss	%xmm2, %xmm1
0000000000307208	jne	0x307220
000000000030720a	jp	0x307220
000000000030720c	movss	0x10(%rax,%rsi), %xmm1
0000000000307212	ucomiss	%xmm3, %xmm1
0000000000307215	jne	0x307220
0000000000307217	jnp	0x307251
0000000000307219	nopl	(%rax)
0000000000307220	ucomiss	%xmm2, %xmm0
0000000000307223	jne	0x30725c
0000000000307225	jp	0x30725c
0000000000307227	movss	0x8(%rax,%rsi), %xmm0
000000000030722d	xorl	%r10d, %r10d
0000000000307230	ucomiss	%xmm3, %xmm0
0000000000307233	jne	0x307260
0000000000307235	jp	0x307260
0000000000307237	movss	0xc(%rax,%rsi), %xmm0
000000000030723d	ucomiss	%xmm5, %xmm0
0000000000307240	jne	0x307260
0000000000307242	jp	0x307260
0000000000307244	movss	0x10(%rax,%rsi), %xmm0
000000000030724a	ucomiss	%xmm7, %xmm0
000000000030724d	jne	0x3072a7
000000000030724f	jp	0x3072a7
0000000000307251	movb	$0x1, %r10b
0000000000307254	testb	$0x1, %dil
0000000000307258	je	0x307266
000000000030725a	jmp	0x3072b0
000000000030725c	xorl	%r10d, %r10d
000000000030725f	nop
0000000000307260	testb	$0x1, %dil
0000000000307264	jne	0x3072b0
0000000000307266	movss	0x4(%rax,%rsi), %xmm0
000000000030726c	ucomiss	%xmm2, %xmm0
000000000030726f	jne	0x307280
0000000000307271	jp	0x307280
0000000000307273	movss	0x8(%rax,%rsi), %xmm0
0000000000307279	ucomiss	%xmm3, %xmm0
000000000030727c	jne	0x307280
000000000030727e	jnp	0x3072b0
0000000000307280	movss	0xc(%rax,%rsi), %xmm0
0000000000307286	ucomiss	%xmm2, %xmm0
0000000000307289	jne	0x30729a
000000000030728b	jp	0x30729a
000000000030728d	movss	0x10(%rax,%rsi), %xmm0
0000000000307293	ucomiss	%xmm3, %xmm0
0000000000307296	jne	0x30729a
0000000000307298	jnp	0x3072b0
000000000030729a	xorl	%edi, %edi
000000000030729c	testb	$0x1, %r9b
00000000003072a0	movb	$0x1, %r9b
00000000003072a3	je	0x3072bc
00000000003072a5	jmp	0x307310
00000000003072a7	xorl	%r10d, %r10d
00000000003072aa	testb	$0x1, %dil
00000000003072ae	je	0x307266
00000000003072b0	movb	$0x1, %dil
00000000003072b3	testb	$0x1, %r9b
00000000003072b7	movb	$0x1, %r9b
00000000003072ba	jne	0x307310
00000000003072bc	movss	0x4(%rax,%rsi), %xmm0
00000000003072c2	ucomiss	%xmm4, %xmm0
00000000003072c5	jne	0x3072d6
00000000003072c7	jp	0x3072d6
00000000003072c9	movss	0x8(%rax,%rsi), %xmm0
00000000003072cf	ucomiss	%xmm6, %xmm0
00000000003072d2	jne	0x3072d6
00000000003072d4	jnp	0x3072f0
00000000003072d6	movss	0xc(%rax,%rsi), %xmm0
00000000003072dc	ucomiss	%xmm4, %xmm0
00000000003072df	jne	0x3072ff
00000000003072e1	jp	0x3072ff
00000000003072e3	movss	0x10(%rax,%rsi), %xmm0
00000000003072e9	ucomiss	%xmm6, %xmm0
00000000003072ec	jne	0x30736b
00000000003072ee	jp	0x30736b
00000000003072f0	movb	$0x1, %r9b
00000000003072f3	testb	$0x1, %r8b
00000000003072f7	jne	0x3070b0
00000000003072fd	jmp	0x30731a
00000000003072ff	xorl	%r9d, %r9d
0000000000307302	nopw	%cs:(%rax,%rax)
0000000000307310	testb	$0x1, %r8b
0000000000307314	jne	0x3070b0
000000000030731a	movss	0x4(%rax,%rsi), %xmm0
0000000000307320	ucomiss	%xmm5, %xmm0
0000000000307323	jne	0x307338
0000000000307325	jp	0x307338
0000000000307327	movss	0x8(%rax,%rsi), %xmm0
000000000030732d	ucomiss	%xmm7, %xmm0
0000000000307330	jne	0x307338
0000000000307332	jnp	0x3070b0
0000000000307338	movss	0xc(%rax,%rsi), %xmm0
000000000030733e	ucomiss	%xmm5, %xmm0
0000000000307341	jne	0x307356
0000000000307343	jp	0x307356
0000000000307345	movss	0x10(%rax,%rsi), %xmm0
000000000030734b	ucomiss	%xmm7, %xmm0
000000000030734e	jne	0x307356
0000000000307350	jnp	0x3070b0
0000000000307356	xorl	%r8d, %r8d
0000000000307359	addq	$0x14, %rsi
000000000030735d	cmpq	%rsi, %rdx
0000000000307360	jne	0x3070c0
0000000000307366	jmp	0x307451
000000000030736b	xorl	%r9d, %r9d
000000000030736e	testb	$0x1, %r8b
0000000000307372	je	0x30731a
0000000000307374	jmp	0x3070b0
0000000000307379	movq	-0xe0(%rbp), %rbx
0000000000307380	jmp	0x3073b9
0000000000307382	movq	-0xe0(%rbp), %rbx
0000000000307389	movd	-0x180(%rbp), %xmm2
0000000000307391	movd	-0x158(%rbp), %xmm3
0000000000307399	movd	-0x160(%rbp), %xmm4
00000000003073a1	movd	-0x16c(%rbp), %xmm5
00000000003073a9	movd	-0x168(%rbp), %xmm6
00000000003073b1	movd	-0x164(%rbp), %xmm7
00000000003073b9	addss	%xmm6, %xmm3
00000000003073bd	addss	%xmm4, %xmm2
00000000003073c1	movss	0x3ffb8b(%rip), %xmm0
00000000003073c9	mulss	%xmm0, %xmm2
00000000003073cd	addss	%xmm5, %xmm2
00000000003073d1	mulss	%xmm0, %xmm3
00000000003073d5	addss	%xmm7, %xmm3
00000000003073d9	mulss	%xmm0, %xmm2
00000000003073dd	xorpd	%xmm1, %xmm1
00000000003073e1	addss	%xmm1, %xmm2
00000000003073e5	mulss	%xmm0, %xmm3
00000000003073e9	movss	%xmm3, -0x4c(%rbp)
00000000003073ee	movss	%xmm2, -0x50(%rbp)
00000000003073f3	movq	%r14, %rdi
00000000003073f6	leaq	-0x50(%rbp), %rsi
00000000003073fa	callq	__ZN13OZVectorShape15isInteriorPointERK9PCVector2IfE ## OZVectorShape::isInteriorPoint(PCVector2<float> const&)
00000000003073ff	xorb	$0x1, %al
0000000000307401	movzbl	%al, %eax
0000000000307404	leal	(%rax,%rax,2), %r12d
0000000000307408	movl	%r12d, 0x18(%r13)
000000000030740c	movss	(%r13), %xmm2
0000000000307412	movss	0x4(%r13), %xmm3
0000000000307418	movss	0x8(%r13), %xmm4
000000000030741e	movss	0xc(%r13), %xmm6
0000000000307424	movss	0x10(%r13), %xmm5
000000000030742a	movss	0x14(%r13), %xmm7
0000000000307430	movl	0xd0(%r14), %ecx
0000000000307437	testq	%rcx, %rcx
000000000030743a	jne	0x307080
0000000000307440	xorl	%r8d, %r8d
0000000000307443	xorl	%r9d, %r9d
0000000000307446	xorl	%edi, %edi
0000000000307448	xorl	%r10d, %r10d
000000000030744b	xorl	%r15d, %r15d
000000000030744e	xorl	%r11d, %r11d
0000000000307451	leal	-0x1(%r12), %eax
0000000000307456	cmpl	$0x1, %eax
0000000000307459	ja	0x307490
000000000030745b	movl	$0x18, %edi
0000000000307460	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000307465	movq	%r13, 0x10(%rax)
0000000000307469	movq	-0xc0(%rbp), %rcx
0000000000307470	movq	%rcx, 0x8(%rax)
0000000000307474	movq	0x8(%r14), %rcx
0000000000307478	movq	%rcx, (%rax)
000000000030747b	movq	%rax, 0x8(%rcx)
000000000030747f	movq	%rax, 0x8(%r14)
0000000000307483	incq	0x18(%r14)
0000000000307487	jmp	0x306c84
000000000030748c	nopl	(%rax)
0000000000307490	leaq	0x10(%r13), %rdx
0000000000307494	movq	%r13, %rsi
0000000000307497	addq	$0x8, %rsi
000000000030749b	movl	%r11d, %ebx
000000000030749e	xorb	$0x1, %bl
00000000003074a1	movl	%ebx, %eax
00000000003074a3	orb	%r15b, %al
00000000003074a6	movl	%eax, %ecx
00000000003074a8	orb	%r10b, %cl
00000000003074ab	notb	%cl
00000000003074ad	andb	%r8b, %cl
00000000003074b0	testb	$0x1, %cl
00000000003074b3	jne	0x306c63
00000000003074b9	andb	%r15b, %bl
00000000003074bc	movl	%r10d, %ecx
00000000003074bf	xorb	$0x1, %cl
00000000003074c2	andb	%dil, %cl
00000000003074c5	andb	%bl, %cl
00000000003074c7	cmpb	$0x1, %cl
00000000003074ca	jne	0x3074f0
00000000003074cc	movq	%rsi, %rdi
00000000003074cf	movq	%rdx, %rsi
00000000003074d2	movq	%r13, %rdx
00000000003074d5	movl	%r12d, %ecx
00000000003074d8	movq	-0xc0(%rbp), %r8
00000000003074df	callq	__ZL15divideSTriangleRK9PCVector2IfES2_S2_N10PTTriangle4TypeERNSt3__14listIPS3_NS5_9allocatorIS7_EEEE ## divideSTriangle(PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, PTTriangle::Type, std::__1::list<PTTriangle*, std::__1::allocator<PTTriangle*>>&)
00000000003074e4	movq	-0xe0(%rbp), %rbx
00000000003074eb	jmp	0x306c7c
00000000003074f0	movq	%r12, -0x70(%rbp)
00000000003074f4	movl	%r11d, %ecx
00000000003074f7	orb	%r15b, %cl
00000000003074fa	sete	%r14b
00000000003074fe	movl	%r10d, %r12d
0000000000307501	andb	%r9b, %r12b
0000000000307504	andb	%r14b, %r12b
0000000000307507	cmpb	$0x1, %r12b
000000000030750b	jne	0x307540
000000000030750d	movq	%r13, %rdi
0000000000307510	movq	%rsi, %rax
0000000000307513	movq	%rdx, %rsi
0000000000307516	movq	%rax, %rdx
0000000000307519	movq	-0x70(%rbp), %rcx
000000000030751d	movq	-0xc0(%rbp), %r8
0000000000307524	callq	__ZL15divideSTriangleRK9PCVector2IfES2_S2_N10PTTriangle4TypeERNSt3__14listIPS3_NS5_9allocatorIS7_EEEE ## divideSTriangle(PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, PTTriangle::Type, std::__1::list<PTTriangle*, std::__1::allocator<PTTriangle*>>&)
0000000000307529	movq	-0x58(%rbp), %r14
000000000030752d	movq	-0x150(%rbp), %r12
0000000000307534	movq	-0xe0(%rbp), %rbx
000000000030753b	jmp	0x3075f6
0000000000307540	andb	%r10b, %bl
0000000000307543	cmpb	$0x1, %bl
0000000000307546	movq	-0x58(%rbp), %r14
000000000030754a	movq	-0x150(%rbp), %r12
0000000000307551	jne	0x307572
0000000000307553	movq	%r13, %rdi
0000000000307556	movq	-0x70(%rbp), %rcx
000000000030755a	movq	-0xc0(%rbp), %r8
0000000000307561	callq	__ZL15divideTTriangleRK9PCVector2IfES2_S2_N10PTTriangle4TypeERNSt3__14listIPS3_NS5_9allocatorIS7_EEEE ## divideTTriangle(PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, PTTriangle::Type, std::__1::list<PTTriangle*, std::__1::allocator<PTTriangle*>>&)
0000000000307566	movq	-0xe0(%rbp), %rbx
000000000030756d	jmp	0x3075f6
0000000000307572	notb	%al
0000000000307574	andb	%r10b, %al
0000000000307577	testb	$0x1, %al
0000000000307579	movq	-0xe0(%rbp), %rbx
0000000000307580	je	0x30759d
0000000000307582	movq	%rsi, %rdi
0000000000307585	movq	%rdx, %rsi
0000000000307588	movq	%r13, %rdx
000000000030758b	movq	-0x70(%rbp), %rcx
000000000030758f	movq	-0xc0(%rbp), %r8
0000000000307596	callq	__ZL15divideTTriangleRK9PCVector2IfES2_S2_N10PTTriangle4TypeERNSt3__14listIPS3_NS5_9allocatorIS7_EEEE ## divideTTriangle(PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, PTTriangle::Type, std::__1::list<PTTriangle*, std::__1::allocator<PTTriangle*>>&)
000000000030759b	jmp	0x3075f6
000000000030759d	movq	%rsi, %rax
00000000003075a0	testb	%r11b, %r15b
00000000003075a3	sete	%sil
00000000003075a7	orb	%r10b, %sil
00000000003075aa	testb	$0x1, %sil
00000000003075ae	je	0x3075dd
00000000003075b0	orb	%r10b, %cl
00000000003075b3	sete	%cl
00000000003075b6	andb	%r9b, %dil
00000000003075b9	andb	%r8b, %dil
00000000003075bc	andb	%cl, %dil
00000000003075bf	cmpb	$0x1, %dil
00000000003075c3	jne	0x307603
00000000003075c5	movq	%r13, %rdi
00000000003075c8	movq	%rax, %rsi
00000000003075cb	movq	-0x70(%rbp), %rcx
00000000003075cf	movq	-0xc0(%rbp), %r8
00000000003075d6	callq	__ZL15divideJTriangleRK9PCVector2IfES2_S2_N10PTTriangle4TypeERNSt3__14listIPS3_NS5_9allocatorIS7_EEEE ## divideJTriangle(PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, PTTriangle::Type, std::__1::list<PTTriangle*, std::__1::allocator<PTTriangle*>>&)
00000000003075db	jmp	0x3075f6
00000000003075dd	movq	%r13, %rdi
00000000003075e0	movq	%rdx, %rsi
00000000003075e3	movq	%rax, %rdx
00000000003075e6	movq	-0x70(%rbp), %rcx
00000000003075ea	movq	-0xc0(%rbp), %r8
00000000003075f1	callq	__ZL15divideTTriangleRK9PCVector2IfES2_S2_N10PTTriangle4TypeERNSt3__14listIPS3_NS5_9allocatorIS7_EEEE ## divideTTriangle(PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, PTTriangle::Type, std::__1::list<PTTriangle*, std::__1::allocator<PTTriangle*>>&)
00000000003075f6	movq	%r13, %rdi
00000000003075f9	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003075fe	jmp	0x306c8b
0000000000307603	movl	$0x18, %edi
0000000000307608	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000030760d	movq	%r13, 0x10(%rax)
0000000000307611	movq	-0xc0(%rbp), %rcx
0000000000307618	movq	%rcx, 0x8(%rax)
000000000030761c	movq	0x8(%r14), %rcx
0000000000307620	movq	%rcx, (%rax)
0000000000307623	movq	%rax, 0x8(%rcx)
0000000000307627	movq	%rax, 0x8(%r14)
000000000030762b	incq	0x18(%r14)
000000000030762f	jmp	0x306c8b
0000000000307634	leaq	0x8(%r14), %r15
0000000000307638	movq	0x10(%r14), %rbx
000000000030763c	movq	%rbx, -0xf0(%rbp)
0000000000307643	cmpq	%r15, %rbx
0000000000307646	je	0x3099c4
000000000030764c	leaq	-0x7c(%rbp), %r13
0000000000307650	movq	%r15, -0xe0(%rbp)
0000000000307657	jmp	0x307787
000000000030765c	cmpltss	%xmm7, %xmm0
0000000000307661	blendvps	%xmm0, %xmm4, %xmm1
0000000000307666	movshdup	%xmm5, %xmm8                    ## xmm8 = xmm5[1,1,3,3]
000000000030766b	movaps	%xmm6, %xmm7
000000000030766e	subss	%xmm5, %xmm7
0000000000307672	addss	%xmm8, %xmm7
0000000000307677	subss	%xmm3, %xmm8
000000000030767c	addss	%xmm5, %xmm8
0000000000307681	movaps	%xmm2, %xmm0
0000000000307684	subss	%xmm7, %xmm0
0000000000307688	mulss	%xmm6, %xmm0
000000000030768c	movaps	%xmm2, %xmm9
0000000000307690	mulss	%xmm8, %xmm9
0000000000307695	movaps	%xmm6, %xmm4
0000000000307698	subss	%xmm8, %xmm4
000000000030769d	movaps	%xmm3, %xmm5
00000000003076a0	mulss	%xmm8, %xmm5
00000000003076a5	mulss	%xmm7, %xmm6
00000000003076a9	subss	%xmm6, %xmm5
00000000003076ad	movq	-0x70(%rbp), %rax
00000000003076b1	movl	$0x4, 0x1c(%rax)
00000000003076b8	movaps	%xmm7, %xmm6
00000000003076bb	insertps	$0x10, %xmm1, %xmm6             ## xmm6 = xmm6[0],xmm1[0],xmm6[2,3]
00000000003076c1	mulss	%xmm7, %xmm1
00000000003076c5	insertps	$0x10, %xmm8, %xmm2             ## xmm2 = xmm2[0],xmm8[0],xmm2[2,3]
00000000003076cc	subps	%xmm2, %xmm6
00000000003076cf	movshdup	%xmm6, %xmm2                    ## xmm2 = xmm6[1,1,3,3]
00000000003076d3	mulss	%xmm3, %xmm2
00000000003076d7	movq	$0x0, 0x30(%rax)
00000000003076df	insertps	$0x10, %xmm7, %xmm0             ## xmm0 = xmm0[0],xmm7[0],xmm0[2,3]
00000000003076e5	insertps	$0x10, %xmm3, %xmm2             ## xmm2 = xmm2[0],xmm3[0],xmm2[2,3]
00000000003076eb	subps	%xmm2, %xmm0
00000000003076ee	addss	%xmm0, %xmm1
00000000003076f2	subss	%xmm9, %xmm1
00000000003076f7	movss	0x3ff851(%rip), %xmm2
00000000003076ff	divss	%xmm1, %xmm2
0000000000307703	movsldup	%xmm2, %xmm1                    ## xmm1 = xmm2[0,0,2,2]
0000000000307707	mulps	%xmm1, %xmm6
000000000030770a	mulps	%xmm1, %xmm0
000000000030770d	mulss	%xmm2, %xmm4
0000000000307711	mulss	%xmm5, %xmm2
0000000000307715	xorps	%xmm1, %xmm1
0000000000307718	cvtss2sd	%xmm4, %xmm1
000000000030771c	cvtss2sd	%xmm2, %xmm2
0000000000307720	cvtps2pd	%xmm0, %xmm0
0000000000307723	cvtps2pd	%xmm6, %xmm3
0000000000307726	movups	%xmm3, 0x20(%rax)
000000000030772a	movups	%xmm0, 0x38(%rax)
000000000030772e	movsd	%xmm1, 0x48(%rax)
0000000000307733	movq	$0x0, 0x50(%rax)
000000000030773b	movsd	%xmm2, 0x58(%rax)
0000000000307740	xorps	%xmm0, %xmm0
0000000000307743	movups	%xmm0, 0x60(%rax)
0000000000307747	movups	%xmm0, 0x70(%rax)
000000000030774b	movups	%xmm0, 0x80(%rax)
0000000000307752	movq	$0x0, 0x90(%rax)
000000000030775d	movq	%rdi, 0x98(%rax)
0000000000307764	movq	%r9, %r8
0000000000307767	movq	%r8, %rdi
000000000030776a	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000030776f	movq	-0x58(%rbp), %r14
0000000000307773	movq	0x8(%rbx), %rbx
0000000000307777	movq	%rbx, -0xf0(%rbp)
000000000030777e	cmpq	%r15, %rbx
0000000000307781	je	0x3099c4
0000000000307787	movq	0x10(%rbx), %rax
000000000030778b	movq	%rax, -0x70(%rbp)
000000000030778f	movl	0x18(%rax), %eax
0000000000307792	decl	%eax
0000000000307794	cmpl	$0x2, %eax
0000000000307797	jb	0x30776f
0000000000307799	movq	%rbx, -0x90(%rbp)
00000000003077a0	movq	-0x58(%rbp), %rax
00000000003077a4	movl	0xe0(%rax), %ecx
00000000003077aa	testq	%rcx, %rcx
00000000003077ad	je	0x307829
00000000003077af	movq	-0x58(%rbp), %rax
00000000003077b3	movq	0xe8(%rax), %r15
00000000003077ba	addq	$0xc, %r15
00000000003077be	nop
00000000003077c0	movq	%rcx, -0x78(%rbp)
00000000003077c4	leaq	-0x8(%r15), %r12
00000000003077c8	movq	-0x70(%rbp), %rdi
00000000003077cc	movq	%r12, %rsi
00000000003077cf	movq	%r15, %rdx
00000000003077d2	leaq	-0x11c(%rbp), %rbx
00000000003077d9	movq	%rbx, %rcx
00000000003077dc	movq	%r13, %r8
00000000003077df	movq	%r13, %r14
00000000003077e2	leaq	-0x120(%rbp), %r13
00000000003077e9	movq	%r13, %r9
00000000003077ec	callq	__ZNK10PTTriangle12lineAdjacentERK9PCVector2IfES3_RiS4_S4_ ## PTTriangle::lineAdjacent(PCVector2<float> const&, PCVector2<float> const&, int&, int&, int&) const
00000000003077f1	testb	%al, %al
00000000003077f3	jne	0x308c70
00000000003077f9	movq	-0x70(%rbp), %rdi
00000000003077fd	movq	%r12, %rsi
0000000000307800	movq	%r15, %rdx
0000000000307803	movq	%rbx, %rcx
0000000000307806	movq	%r14, %r8
0000000000307809	movq	%r13, %r9
000000000030780c	callq	__ZNK10PTTriangle19edgeContainedByLineERK9PCVector2IfES3_RiS4_S4_ ## PTTriangle::edgeContainedByLine(PCVector2<float> const&, PCVector2<float> const&, int&, int&, int&) const
0000000000307811	testb	%al, %al
0000000000307813	jne	0x308c70
0000000000307819	addq	$0x14, %r15
000000000030781d	movq	-0x78(%rbp), %rcx
0000000000307821	decq	%rcx
0000000000307824	movq	%r14, %r13
0000000000307827	jne	0x3077c0
0000000000307829	movq	-0x58(%rbp), %rax
000000000030782d	movl	0xc0(%rax), %ebx
0000000000307833	testl	%ebx, %ebx
0000000000307835	je	0x308e6a
000000000030783b	xorl	%r13d, %r13d
000000000030783e	xorl	%ecx, %ecx
0000000000307840	movq	$0x0, -0xa0(%rbp)
000000000030784b	jmp	0x307869
000000000030784d	nopl	(%rax)
0000000000307850	movq	-0x78(%rbp), %rcx
0000000000307854	incq	%rcx
0000000000307857	movl	%ebx, %eax
0000000000307859	addq	$0xa8, %r13
0000000000307860	cmpq	%rax, %rcx
0000000000307863	jae	0x308e42
0000000000307869	movq	%rcx, -0x78(%rbp)
000000000030786d	movq	-0x58(%rbp), %rax
0000000000307871	movq	0xc8(%rax), %r15
0000000000307878	leaq	(%r15,%r13), %r12
000000000030787c	leaq	-0x120(%rbp), %rax
0000000000307883	movq	%rax, 0x8(%rsp)
0000000000307888	leaq	-0x7c(%rbp), %rax
000000000030788c	movq	%rax, (%rsp)
0000000000307890	movq	-0x70(%rbp), %r14
0000000000307894	movq	%r14, %rdi
0000000000307897	movq	%r12, %rsi
000000000030789a	leaq	-0x110(%rbp), %rdx
00000000003078a1	leaq	-0x108(%rbp), %rcx
00000000003078a8	leaq	-0xe8(%rbp), %r8
00000000003078af	leaq	-0x11c(%rbp), %r9
00000000003078b6	callq	__ZNK10PTTriangle12edgeAdjacentERKS_RiS2_S2_S2_S2_S2_ ## PTTriangle::edgeAdjacent(PTTriangle const&, int&, int&, int&, int&, int&, int&) const
00000000003078bb	testb	%al, %al
00000000003078bd	je	0x307850
00000000003078bf	movl	0x18(%r15,%r13), %eax
00000000003078c4	movl	%eax, 0x1c(%r14)
00000000003078c8	movq	%r12, %r8
00000000003078cb	cmpq	%r14, %r12
00000000003078ce	je	0x3079bc
00000000003078d4	movsd	0x20(%r15,%r13), %xmm0
00000000003078db	movsd	%xmm0, 0x20(%r14)
00000000003078e1	movsd	0x28(%r15,%r13), %xmm0
00000000003078e8	movsd	%xmm0, 0x28(%r14)
00000000003078ee	movsd	0x30(%r15,%r13), %xmm0
00000000003078f5	movsd	%xmm0, 0x30(%r14)
00000000003078fb	movsd	0x38(%r15,%r13), %xmm0
0000000000307902	movsd	%xmm0, 0x38(%r14)
0000000000307908	movsd	0x40(%r15,%r13), %xmm0
000000000030790f	movsd	%xmm0, 0x40(%r14)
0000000000307915	movsd	0x48(%r15,%r13), %xmm0
000000000030791c	movsd	%xmm0, 0x48(%r14)
0000000000307922	movsd	0x50(%r15,%r13), %xmm0
0000000000307929	movsd	%xmm0, 0x50(%r14)
000000000030792f	movsd	0x58(%r15,%r13), %xmm0
0000000000307936	movsd	%xmm0, 0x58(%r14)
000000000030793c	movsd	0x60(%r15,%r13), %xmm0
0000000000307943	movsd	%xmm0, 0x60(%r14)
0000000000307949	movsd	0x68(%r15,%r13), %xmm0
0000000000307950	movsd	%xmm0, 0x68(%r14)
0000000000307956	movsd	0x70(%r15,%r13), %xmm0
000000000030795d	movsd	%xmm0, 0x70(%r14)
0000000000307963	movsd	0x78(%r15,%r13), %xmm0
000000000030796a	movsd	%xmm0, 0x78(%r14)
0000000000307970	movsd	0x80(%r15,%r13), %xmm0
000000000030797a	movsd	%xmm0, 0x80(%r14)
0000000000307983	movsd	0x88(%r15,%r13), %xmm0
000000000030798d	movsd	%xmm0, 0x88(%r14)
0000000000307996	movsd	0x90(%r15,%r13), %xmm0
00000000003079a0	movsd	%xmm0, 0x90(%r14)
00000000003079a9	movsd	0x98(%r15,%r13), %xmm0
00000000003079b3	movsd	%xmm0, 0x98(%r14)
00000000003079bc	movl	-0x11c(%rbp), %eax
00000000003079c2	movl	-0x7c(%rbp), %ecx
00000000003079c5	movl	%ecx, %edx
00000000003079c7	xorl	$0x2, %edx
00000000003079ca	orl	%eax, %edx
00000000003079cc	je	0x3079e2
00000000003079ce	xorl	$0x2, %eax
00000000003079d1	movb	$0x1, %dl
00000000003079d3	movq	%rdx, -0xa0(%rbp)
00000000003079da	orl	%ecx, %eax
00000000003079dc	jne	0x307850
00000000003079e2	xorps	%xmm0, %xmm0
00000000003079e5	movaps	%xmm0, -0x50(%rbp)
00000000003079e9	movq	$0x0, -0x40(%rbp)
00000000003079f1	movslq	-0x110(%rbp), %rsi
00000000003079f8	movq	-0x70(%rbp), %rdi
00000000003079fc	movq	(%rdi,%rsi,8), %rax
0000000000307a00	movq	%rax, -0x50(%rbp,%rsi,8)
0000000000307a05	movslq	-0x108(%rbp), %rdx
0000000000307a0c	movq	(%rdi,%rdx,8), %rax
0000000000307a10	movq	%rax, -0x50(%rbp,%rdx,8)
0000000000307a15	movslq	-0xe8(%rbp), %rax
0000000000307a1c	movq	(%rdi,%rax,8), %rcx
0000000000307a20	movq	%rcx, -0x50(%rbp,%rax,8)
0000000000307a25	cvtps2pd	-0x50(%rbp,%rsi,8), %xmm5
0000000000307a2a	movupd	0x80(%rdi), %xmm2
0000000000307a32	movapd	%xmm2, %xmm0
0000000000307a36	mulpd	%xmm5, %xmm0
0000000000307a3a	movapd	%xmm0, %xmm1
0000000000307a3e	unpckhpd	%xmm0, %xmm1                    ## xmm1 = xmm1[1],xmm0[1]
0000000000307a42	addsd	%xmm0, %xmm1
0000000000307a46	movsd	0x98(%rdi), %xmm3
0000000000307a4e	addsd	%xmm3, %xmm1
0000000000307a52	xorps	%xmm0, %xmm0
0000000000307a55	cvtsd2ss	%xmm1, %xmm0
0000000000307a59	cvtss2sd	%xmm0, %xmm7
0000000000307a5d	movupd	0x20(%rdi), %xmm4
0000000000307a62	movupd	0x38(%rdi), %xmm1
0000000000307a67	movupd	0x40(%rdi), %xmm0
0000000000307a6c	movsd	0x28(%rdi), %xmm6
0000000000307a71	movapd	%xmm6, %xmm8
0000000000307a76	movhpd	0x48(%rdi), %xmm8               ## xmm8 = xmm8[0],mem[0]
0000000000307a7c	movddup	%xmm5, %xmm9                    ## xmm9 = xmm5[0,0]
0000000000307a81	unpckhpd	%xmm5, %xmm5                    ## xmm5 = xmm5[1,1]
0000000000307a85	mulpd	%xmm8, %xmm5
0000000000307a8a	movapd	%xmm4, %xmm8
0000000000307a8f	unpcklpd	%xmm0, %xmm8                    ## xmm8 = xmm8[0],xmm0[0]
0000000000307a94	mulpd	%xmm9, %xmm8
0000000000307a99	addpd	%xmm5, %xmm8
0000000000307a9e	movsd	0x58(%rdi), %xmm5
0000000000307aa3	movapd	%xmm1, %xmm9
0000000000307aa8	unpcklpd	%xmm5, %xmm9                    ## xmm9 = xmm9[0],xmm5[0]
0000000000307aad	addpd	%xmm8, %xmm9
0000000000307ab2	movddup	%xmm7, %xmm7                    ## xmm7 = xmm7[0,0]
0000000000307ab6	divpd	%xmm7, %xmm9
0000000000307abb	cvtpd2ps	%xmm9, %xmm7
0000000000307ac0	movhpd	0x38(%rdi), %xmm5               ## xmm5 = xmm5[0],mem[0]
0000000000307ac5	movlpd	%xmm7, -0x50(%rbp,%rsi,8)
0000000000307acb	cvtps2pd	-0x50(%rbp,%rdx,8), %xmm7
0000000000307ad0	movapd	%xmm2, %xmm8
0000000000307ad5	mulpd	%xmm7, %xmm8
0000000000307ada	movapd	%xmm8, %xmm9
0000000000307adf	unpckhpd	%xmm8, %xmm9                    ## xmm9 = xmm9[1],xmm8[1]
0000000000307ae4	addsd	%xmm8, %xmm9
0000000000307ae9	addsd	%xmm3, %xmm9
0000000000307aee	xorps	%xmm8, %xmm8
0000000000307af2	cvtsd2ss	%xmm9, %xmm8
0000000000307af7	cvtss2sd	%xmm8, %xmm8
0000000000307afc	movapd	%xmm0, %xmm9
0000000000307b01	unpcklpd	%xmm6, %xmm9                    ## xmm9 = xmm9[0],xmm6[0]
0000000000307b06	mulpd	%xmm7, %xmm9
0000000000307b0b	blendpd	$0x1, %xmm4, %xmm0              ## xmm0 = xmm4[0],xmm0[1]
0000000000307b11	mulpd	%xmm0, %xmm7
0000000000307b15	shufpd	$0x1, %xmm7, %xmm7              ## xmm7 = xmm7[1,0]
0000000000307b1a	addpd	%xmm9, %xmm7
0000000000307b1f	addpd	%xmm5, %xmm7
0000000000307b23	movddup	%xmm8, %xmm6                    ## xmm6 = xmm8[0,0]
0000000000307b28	divpd	%xmm6, %xmm7
0000000000307b2c	cvtpd2ps	%xmm7, %xmm6
0000000000307b30	shufps	$0xe1, %xmm6, %xmm6             ## xmm6 = xmm6[1,0,2,3]
0000000000307b34	movlps	%xmm6, -0x50(%rbp,%rdx,8)
0000000000307b39	cvtps2pd	-0x50(%rbp,%rax,8), %xmm6
0000000000307b3e	mulpd	%xmm6, %xmm2
0000000000307b42	movapd	%xmm2, %xmm7
0000000000307b46	unpckhpd	%xmm2, %xmm7                    ## xmm7 = xmm7[1],xmm2[1]
0000000000307b4a	addsd	%xmm2, %xmm7
0000000000307b4e	addsd	%xmm3, %xmm7
0000000000307b52	xorps	%xmm2, %xmm2
0000000000307b55	cvtsd2ss	%xmm7, %xmm2
0000000000307b59	cvtss2sd	%xmm2, %xmm2
0000000000307b5d	unpckhpd	%xmm4, %xmm1                    ## xmm1 = xmm1[1],xmm4[1]
0000000000307b61	mulpd	%xmm6, %xmm1
0000000000307b65	mulpd	%xmm6, %xmm0
0000000000307b69	shufpd	$0x1, %xmm0, %xmm0              ## xmm0 = xmm0[1,0]
0000000000307b6e	addpd	%xmm1, %xmm0
0000000000307b72	addpd	%xmm5, %xmm0
0000000000307b76	movddup	%xmm2, %xmm1                    ## xmm1 = xmm2[0,0]
0000000000307b7a	divpd	%xmm1, %xmm0
0000000000307b7e	cvtpd2ps	%xmm0, %xmm0
0000000000307b82	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
0000000000307b86	movss	%xmm1, -0x50(%rbp,%rax,8)
0000000000307b8c	movss	%xmm0, -0x4c(%rbp,%rax,8)
0000000000307b92	mulss	%xmm1, %xmm1
0000000000307b96	ucomiss	%xmm0, %xmm1
0000000000307b99	jbe	0x308c50
0000000000307b9f	movss	-0x50(%rbp,%rsi,8), %xmm1
0000000000307ba5	xorps	%xmm8, %xmm8
0000000000307ba9	cvtss2sd	%xmm1, %xmm8
0000000000307bae	cvtps2pd	%xmm0, %xmm0
0000000000307bb1	movss	-0x4c(%rbp,%rsi,8), %xmm1
0000000000307bb7	xorps	%xmm9, %xmm9
0000000000307bbb	cvtss2sd	%xmm1, %xmm9
0000000000307bc0	movaps	%xmm8, %xmm1
0000000000307bc4	movsd	0x3fe0ac(%rip), %xmm5
0000000000307bcc	mulsd	%xmm5, %xmm1
0000000000307bd0	movapd	%xmm0, %xmm2
0000000000307bd4	unpckhpd	%xmm0, %xmm2                    ## xmm2 = xmm2[1],xmm0[1]
0000000000307bd8	movapd	%xmm1, %xmm4
0000000000307bdc	mulsd	%xmm2, %xmm4
0000000000307be0	movapd	%xmm4, %xmm3
0000000000307be4	mulsd	%xmm0, %xmm3
0000000000307be8	mulsd	%xmm8, %xmm1
0000000000307bed	mulsd	%xmm0, %xmm1
0000000000307bf1	subsd	%xmm3, %xmm1
0000000000307bf5	movapd	%xmm2, %xmm3
0000000000307bf9	mulsd	%xmm5, %xmm3
0000000000307bfd	movapd	%xmm0, %xmm5
0000000000307c01	unpcklpd	%xmm3, %xmm5                    ## xmm5 = xmm5[0],xmm3[0]
0000000000307c05	mulpd	%xmm0, %xmm5
0000000000307c09	addsd	%xmm5, %xmm1
0000000000307c0d	movapd	%xmm5, %xmm3
0000000000307c11	unpckhpd	%xmm5, %xmm3                    ## xmm3 = xmm3[1],xmm5[1]
0000000000307c15	movapd	%xmm3, %xmm6
0000000000307c19	mulsd	%xmm9, %xmm6
0000000000307c1e	addsd	%xmm1, %xmm6
0000000000307c22	mulsd	%xmm9, %xmm4
0000000000307c27	subsd	%xmm4, %xmm6
0000000000307c2b	movapd	%xmm9, %xmm1
0000000000307c30	addsd	%xmm9, %xmm1
0000000000307c35	mulsd	%xmm0, %xmm1
0000000000307c39	subsd	%xmm1, %xmm6
0000000000307c3d	movapd	%xmm9, %xmm4
0000000000307c42	mulsd	%xmm9, %xmm4
0000000000307c47	addsd	%xmm6, %xmm4
0000000000307c4b	xorpd	%xmm1, %xmm1
0000000000307c4f	ucomisd	%xmm4, %xmm1
0000000000307c53	xorpd	%xmm1, %xmm1
0000000000307c57	movapd	%xmm2, %xmm7
0000000000307c5b	mulsd	%xmm2, %xmm7
0000000000307c5f	xorpd	%xmm6, %xmm6
0000000000307c63	ja	0x307cdf
0000000000307c65	movapd	%xmm8, %xmm6
0000000000307c6a	addsd	%xmm8, %xmm6
0000000000307c6f	movapd	%xmm6, %xmm10
0000000000307c74	mulsd	%xmm2, %xmm10
0000000000307c79	movapd	%xmm7, %xmm11
0000000000307c7e	subsd	%xmm10, %xmm11
0000000000307c83	mulsd	%xmm8, %xmm6
0000000000307c88	mulsd	%xmm8, %xmm8
0000000000307c8d	addsd	%xmm11, %xmm8
0000000000307c92	addsd	%xmm8, %xmm8
0000000000307c97	subsd	%xmm10, %xmm6
0000000000307c9c	addsd	%xmm0, %xmm6
0000000000307ca0	subsd	%xmm9, %xmm6
0000000000307ca5	xorps	%xmm9, %xmm9
0000000000307ca9	sqrtsd	%xmm4, %xmm9
0000000000307cae	movapd	%xmm6, %xmm10
0000000000307cb3	addsd	%xmm9, %xmm10
0000000000307cb8	subsd	%xmm9, %xmm6
0000000000307cbd	unpcklpd	%xmm6, %xmm10                   ## xmm10 = xmm10[0],xmm6[0]
0000000000307cc2	movddup	%xmm8, %xmm6                    ## xmm6 = xmm8[0,0]
0000000000307cc7	divpd	%xmm6, %xmm10
0000000000307ccc	movapd	%xmm10, %xmm6
0000000000307cd1	unpckhpd	%xmm10, %xmm6                   ## xmm6 = xmm6[1],xmm10[1]
0000000000307cd6	maxsd	%xmm10, %xmm6
0000000000307cdb	cvtsd2ss	%xmm6, %xmm6
0000000000307cdf	movss	-0x50(%rbp,%rdx,8), %xmm8
0000000000307ce6	cvtss2sd	%xmm8, %xmm8
0000000000307ceb	movss	-0x4c(%rbp,%rdx,8), %xmm9
0000000000307cf2	cvtss2sd	%xmm9, %xmm9
0000000000307cf7	movaps	%xmm8, %xmm10
0000000000307cfb	mulsd	0x3fdf74(%rip), %xmm10
0000000000307d04	movapd	%xmm10, %xmm11
0000000000307d09	mulsd	%xmm8, %xmm11
0000000000307d0e	unpcklpd	%xmm10, %xmm11                  ## xmm11 = xmm11[0],xmm10[0]
0000000000307d13	mulpd	%xmm0, %xmm11
0000000000307d18	movapd	%xmm11, %xmm10
0000000000307d1d	unpckhpd	%xmm11, %xmm10                  ## xmm10 = xmm10[1],xmm11[1]
0000000000307d22	movapd	%xmm10, %xmm12
0000000000307d27	mulsd	%xmm0, %xmm12
0000000000307d2c	subsd	%xmm12, %xmm11
0000000000307d31	mulsd	%xmm9, %xmm3
0000000000307d36	addsd	%xmm11, %xmm5
0000000000307d3b	addsd	%xmm3, %xmm5
0000000000307d3f	mulsd	%xmm9, %xmm10
0000000000307d44	subsd	%xmm10, %xmm5
0000000000307d49	movapd	%xmm9, %xmm3
0000000000307d4e	addsd	%xmm9, %xmm3
0000000000307d53	mulsd	%xmm0, %xmm3
0000000000307d57	subsd	%xmm3, %xmm5
0000000000307d5b	movapd	%xmm9, %xmm3
0000000000307d60	mulsd	%xmm9, %xmm3
0000000000307d65	addsd	%xmm5, %xmm3
0000000000307d69	xorpd	%xmm5, %xmm5
0000000000307d6d	ucomisd	%xmm3, %xmm5
0000000000307d71	movabsq	$0x3ff0000000000000, %rbx       ## imm = 0x3FF0000000000000
0000000000307d7b	movq	%r8, -0x100(%rbp)
0000000000307d82	ja	0x307deb
0000000000307d84	movapd	%xmm8, %xmm1
0000000000307d89	addsd	%xmm8, %xmm1
0000000000307d8e	movapd	%xmm1, %xmm5
0000000000307d92	mulsd	%xmm2, %xmm5
0000000000307d96	subsd	%xmm5, %xmm7
0000000000307d9a	mulsd	%xmm8, %xmm1
0000000000307d9f	mulsd	%xmm8, %xmm8
0000000000307da4	addsd	%xmm7, %xmm8
0000000000307da9	addsd	%xmm8, %xmm8
0000000000307dae	subsd	%xmm5, %xmm1
0000000000307db2	addsd	%xmm0, %xmm1
0000000000307db6	subsd	%xmm9, %xmm1
0000000000307dbb	sqrtsd	%xmm3, %xmm0
0000000000307dbf	movapd	%xmm1, %xmm2
0000000000307dc3	addsd	%xmm0, %xmm2
0000000000307dc7	subsd	%xmm0, %xmm1
0000000000307dcb	unpcklpd	%xmm1, %xmm2                    ## xmm2 = xmm2[0],xmm1[0]
0000000000307dcf	movddup	%xmm8, %xmm0                    ## xmm0 = xmm8[0,0]
0000000000307dd4	divpd	%xmm0, %xmm2
0000000000307dd8	movapd	%xmm2, %xmm0
0000000000307ddc	unpckhpd	%xmm2, %xmm0                    ## xmm0 = xmm0[1],xmm2[1]
0000000000307de0	maxsd	%xmm2, %xmm0
0000000000307de4	xorps	%xmm1, %xmm1
0000000000307de7	cvtsd2ss	%xmm0, %xmm1
0000000000307deb	movq	-0x70(%rbp), %rdx
0000000000307def	leaq	(%rdx,%rax,8), %rax
0000000000307df3	movq	%rax, -0xa0(%rbp)
0000000000307dfa	movq	%rcx, %xmm2
0000000000307dff	xorpd	%xmm0, %xmm0
0000000000307e03	ucomisd	%xmm4, %xmm0
0000000000307e07	movq	$0x0, -0xd0(%rbp)
0000000000307e12	movq	$0x0, -0xc8(%rbp)
0000000000307e1d	movb	$0x1, %al
0000000000307e1f	movb	$0x1, %cl
0000000000307e21	ja	0x307f14
0000000000307e27	movslq	-0x110(%rbp), %rcx
0000000000307e2e	movq	-0x70(%rbp), %rsi
0000000000307e32	movsd	(%rsi,%rcx,8), %xmm4
0000000000307e37	movdqa	%xmm2, %xmm0
0000000000307e3b	subps	%xmm4, %xmm0
0000000000307e3e	movsldup	%xmm6, %xmm6                    ## xmm6 = xmm6[0,0,2,2]
0000000000307e42	mulps	%xmm0, %xmm6
0000000000307e45	addps	%xmm4, %xmm6
0000000000307e48	movaps	%xmm4, %xmm5
0000000000307e4b	subps	%xmm2, %xmm5
0000000000307e4e	movaps	%xmm5, %xmm0
0000000000307e51	mulps	%xmm5, %xmm0
0000000000307e54	movshdup	%xmm0, %xmm7                    ## xmm7 = xmm0[1,1,3,3]
0000000000307e58	addss	%xmm0, %xmm7
0000000000307e5c	xorps	%xmm0, %xmm0
0000000000307e5f	sqrtss	%xmm7, %xmm0
0000000000307e63	movsldup	%xmm0, %xmm7                    ## xmm7 = xmm0[0,0,2,2]
0000000000307e67	andps	0x3ffd52(%rip), %xmm0
0000000000307e6e	xorl	%edx, %edx
0000000000307e70	movss	0x3ffd67(%rip), %xmm8
0000000000307e79	ucomiss	%xmm0, %xmm8
0000000000307e7d	setbe	%dl
0000000000307e80	movaps	%xmm5, %xmm8
0000000000307e84	divps	%xmm7, %xmm8
0000000000307e88	movd	%edx, %xmm0
0000000000307e8c	pshufd	$0x50, %xmm0, %xmm0             ## xmm0 = xmm0[0,0,1,1]
0000000000307e91	pslld	$0x1f, %xmm0
0000000000307e96	blendvps	%xmm0, %xmm8, %xmm5
0000000000307e9c	addps	%xmm5, %xmm5
0000000000307e9f	addps	%xmm6, %xmm5
0000000000307ea2	movlps	%xmm5, -0xd0(%rbp)
0000000000307ea9	movaps	%xmm5, %xmm0
0000000000307eac	cmpltps	%xmm4, %xmm0
0000000000307eb0	unpcklps	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,1,1]
0000000000307eb3	movmskpd	%xmm0, %edx
0000000000307eb7	testl	%edx, %edx
0000000000307eb9	je	0x307ec1
0000000000307ebb	leaq	(%rsi,%rcx,8), %rcx
0000000000307ebf	jmp	0x307eda
0000000000307ec1	movaps	%xmm2, %xmm0
0000000000307ec4	cmpltps	%xmm5, %xmm0
0000000000307ec8	unpcklps	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,1,1]
0000000000307ecb	movmskpd	%xmm0, %edx
0000000000307ecf	movq	-0xa0(%rbp), %rcx
0000000000307ed6	testl	%edx, %edx
0000000000307ed8	je	0x307ee9
0000000000307eda	movq	(%rcx), %rcx
0000000000307edd	movq	%rcx, -0xd0(%rbp)
0000000000307ee4	movq	%rcx, %xmm5
0000000000307ee9	cmpeqps	%xmm5, %xmm4
0000000000307eed	unpcklps	%xmm4, %xmm4                    ## xmm4 = xmm4[0,0,1,1]
0000000000307ef0	movmskpd	%xmm4, %edx
0000000000307ef4	movb	$0x1, %cl
0000000000307ef6	cmpl	$0x3, %edx
0000000000307ef9	je	0x307f14
0000000000307efb	ucomiss	%xmm2, %xmm5
0000000000307efe	jne	0x308022
0000000000307f04	jp	0x308022
0000000000307f0a	cmpeqps	%xmm2, %xmm5
0000000000307f0e	pextrb	$0x4, %xmm5, %ecx
0000000000307f14	xorpd	%xmm0, %xmm0
0000000000307f18	ucomisd	%xmm3, %xmm0
0000000000307f1c	ja	0x308032
0000000000307f22	movslq	-0x108(%rbp), %rdx
0000000000307f29	movq	-0xa0(%rbp), %r8
0000000000307f30	movss	0x4(%r8), %xmm3
0000000000307f36	movq	-0x70(%rbp), %rdi
0000000000307f3a	movsd	(%rdi,%rdx,8), %xmm4
0000000000307f3f	movaps	%xmm2, %xmm0
0000000000307f42	insertps	$0x10, %xmm3, %xmm0             ## xmm0 = xmm0[0],xmm3[0],xmm0[2,3]
0000000000307f48	movaps	%xmm4, %xmm5
0000000000307f4b	subps	%xmm0, %xmm5
0000000000307f4e	subps	%xmm4, %xmm0
0000000000307f51	movsldup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0,2,2]
0000000000307f55	mulps	%xmm0, %xmm1
0000000000307f58	addps	%xmm4, %xmm1
0000000000307f5b	movaps	%xmm5, %xmm0
0000000000307f5e	mulps	%xmm5, %xmm0
0000000000307f61	movshdup	%xmm0, %xmm6                    ## xmm6 = xmm0[1,1,3,3]
0000000000307f65	addss	%xmm0, %xmm6
0000000000307f69	xorps	%xmm0, %xmm0
0000000000307f6c	sqrtss	%xmm6, %xmm0
0000000000307f70	movsldup	%xmm0, %xmm6                    ## xmm6 = xmm0[0,0,2,2]
0000000000307f74	andps	0x3ffc45(%rip), %xmm0
0000000000307f7b	xorl	%esi, %esi
0000000000307f7d	movss	0x3ffc5b(%rip), %xmm7
0000000000307f85	ucomiss	%xmm0, %xmm7
0000000000307f88	setbe	%sil
0000000000307f8c	movaps	%xmm5, %xmm7
0000000000307f8f	divps	%xmm6, %xmm7
0000000000307f92	movd	%esi, %xmm0
0000000000307f96	pshufd	$0x50, %xmm0, %xmm0             ## xmm0 = xmm0[0,0,1,1]
0000000000307f9b	pslld	$0x1f, %xmm0
0000000000307fa0	blendvps	%xmm0, %xmm7, %xmm5
0000000000307fa5	addps	%xmm5, %xmm5
0000000000307fa8	addps	%xmm1, %xmm5
0000000000307fab	movlps	%xmm5, -0xc8(%rbp)
0000000000307fb2	movaps	%xmm5, %xmm0
0000000000307fb5	cmpltps	%xmm4, %xmm0
0000000000307fb9	unpcklps	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,1,1]
0000000000307fbc	movmskpd	%xmm0, %esi
0000000000307fc0	testl	%esi, %esi
0000000000307fc2	je	0x307fd9
0000000000307fc4	leaq	(%rdi,%rdx,8), %rdx
0000000000307fc8	movq	(%rdx), %rdx
0000000000307fcb	movq	%rdx, -0xc8(%rbp)
0000000000307fd2	movq	%rdx, %xmm5
0000000000307fd7	jmp	0x307ff1
0000000000307fd9	ucomiss	%xmm2, %xmm5
0000000000307fdc	movq	%r8, %rdx
0000000000307fdf	ja	0x307fc8
0000000000307fe1	movshdup	%xmm5, %xmm0                    ## xmm0 = xmm5[1,1,3,3]
0000000000307fe5	ucomiss	%xmm3, %xmm0
0000000000307fe8	movq	-0xa0(%rbp), %rdx
0000000000307fef	ja	0x307fc8
0000000000307ff1	cmpeqps	%xmm5, %xmm4
0000000000307ff5	unpcklps	%xmm4, %xmm4                    ## xmm4 = xmm4[0,0,1,1]
0000000000307ff8	movmskpd	%xmm4, %edx
0000000000307ffc	cmpl	$0x3, %edx
0000000000307fff	je	0x308032
0000000000308001	ucomiss	%xmm2, %xmm5
0000000000308004	jne	0x3083a4
000000000030800a	jp	0x3083a4
0000000000308010	movshdup	%xmm5, %xmm0                    ## xmm0 = xmm5[1,1,3,3]
0000000000308014	cmpeqss	%xmm3, %xmm0
0000000000308019	movd	%xmm0, %eax
000000000030801d	andl	$0x1, %eax
0000000000308020	jmp	0x308032
0000000000308022	xorl	%ecx, %ecx
0000000000308024	xorpd	%xmm0, %xmm0
0000000000308028	ucomisd	%xmm3, %xmm0
000000000030802c	jbe	0x307f22
0000000000308032	movl	%ecx, %edx
0000000000308034	andb	%al, %dl
0000000000308036	testb	$0x1, %dl
0000000000308039	je	0x30804a
000000000030803b	movq	-0x70(%rbp), %rcx
000000000030803f	movl	0x18(%rcx), %eax
0000000000308042	movl	%eax, 0x1c(%rcx)
0000000000308045	jmp	0x308c50
000000000030804a	testb	$0x1, %cl
000000000030804d	jne	0x3083ad
0000000000308053	testb	%al, %al
0000000000308055	je	0x3086f6
000000000030805b	movl	$0xa8, %edi
0000000000308060	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000308065	movq	%rax, %r12
0000000000308068	movslq	-0x110(%rbp), %rax
000000000030806f	movslq	-0x108(%rbp), %rdi
0000000000308076	movq	-0x70(%rbp), %rsi
000000000030807a	movl	0x18(%rsi), %ecx
000000000030807d	xorps	%xmm0, %xmm0
0000000000308080	movups	%xmm0, (%r12)
0000000000308085	movq	$0x0, 0x10(%r12)
000000000030808e	movl	$0x3, 0x1c(%r12)
0000000000308097	movq	%rbx, 0x98(%r12)
000000000030809f	movq	%rbx, 0x70(%r12)
00000000003080a4	movq	%rbx, 0x48(%r12)
00000000003080a9	movq	%rbx, 0x20(%r12)
00000000003080ae	movups	%xmm0, 0x28(%r12)
00000000003080b4	movups	%xmm0, 0x38(%r12)
00000000003080ba	movups	%xmm0, 0x50(%r12)
00000000003080c0	movups	%xmm0, 0x60(%r12)
00000000003080c6	movups	%xmm0, 0x78(%r12)
00000000003080cc	movups	%xmm0, 0x88(%r12)
00000000003080d5	movl	__ZN10PTTriangle9idCounterE(%rip), %ebx ## PTTriangle::idCounter
00000000003080db	leal	0x1(%rbx), %edx
00000000003080de	movl	%edx, __ZN10PTTriangle9idCounterE(%rip) ## PTTriangle::idCounter
00000000003080e4	movl	%edx, 0xa0(%r12)
00000000003080ec	movl	$0x0, 0xa4(%r12)
00000000003080f8	movq	(%rsi,%rax,8), %rax
00000000003080fc	movq	%rax, (%r12)
0000000000308100	movq	%rdi, -0xb8(%rbp)
0000000000308107	movq	(%rsi,%rdi,8), %rax
000000000030810b	movq	%rax, 0x8(%r12)
0000000000308110	movq	-0xd0(%rbp), %rax
0000000000308117	movq	%rax, -0xb0(%rbp)
000000000030811e	movq	%rax, 0x10(%r12)
0000000000308123	movl	%ecx, 0x18(%r12)
0000000000308128	movl	0x18(%r15,%r13), %eax
000000000030812d	movl	%eax, 0x1c(%r12)
0000000000308132	cmpq	%r12, -0x100(%rbp)
0000000000308139	je	0x308237
000000000030813f	movsd	0x20(%r15,%r13), %xmm0
0000000000308146	movsd	%xmm0, 0x20(%r12)
000000000030814d	movsd	0x28(%r15,%r13), %xmm0
0000000000308154	movsd	%xmm0, 0x28(%r12)
000000000030815b	movsd	0x30(%r15,%r13), %xmm0
0000000000308162	movsd	%xmm0, 0x30(%r12)
0000000000308169	movsd	0x38(%r15,%r13), %xmm0
0000000000308170	movsd	%xmm0, 0x38(%r12)
0000000000308177	movsd	0x40(%r15,%r13), %xmm0
000000000030817e	movsd	%xmm0, 0x40(%r12)
0000000000308185	movsd	0x48(%r15,%r13), %xmm0
000000000030818c	movsd	%xmm0, 0x48(%r12)
0000000000308193	movsd	0x50(%r15,%r13), %xmm0
000000000030819a	movsd	%xmm0, 0x50(%r12)
00000000003081a1	movsd	0x58(%r15,%r13), %xmm0
00000000003081a8	movsd	%xmm0, 0x58(%r12)
00000000003081af	movsd	0x60(%r15,%r13), %xmm0
00000000003081b6	movsd	%xmm0, 0x60(%r12)
00000000003081bd	movsd	0x68(%r15,%r13), %xmm0
00000000003081c4	movsd	%xmm0, 0x68(%r12)
00000000003081cb	movsd	0x70(%r15,%r13), %xmm0
00000000003081d2	movsd	%xmm0, 0x70(%r12)
00000000003081d9	movsd	0x78(%r15,%r13), %xmm0
00000000003081e0	movsd	%xmm0, 0x78(%r12)
00000000003081e7	movsd	0x80(%r15,%r13), %xmm0
00000000003081f1	movsd	%xmm0, 0x80(%r12)
00000000003081fb	movsd	0x88(%r15,%r13), %xmm0
0000000000308205	movsd	%xmm0, 0x88(%r12)
000000000030820f	movsd	0x90(%r15,%r13), %xmm0
0000000000308219	movsd	%xmm0, 0x90(%r12)
0000000000308223	movsd	0x98(%r15,%r13), %xmm0
000000000030822d	movsd	%xmm0, 0x98(%r12)
0000000000308237	movl	$0xa8, %edi
000000000030823c	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000308241	movq	-0xa0(%rbp), %r14
0000000000308248	movq	%rax, %r15
000000000030824b	movq	-0x70(%rbp), %rdx
000000000030824f	movl	0x18(%rdx), %eax
0000000000308252	xorps	%xmm0, %xmm0
0000000000308255	movups	%xmm0, (%r15)
0000000000308259	movq	$0x0, 0x10(%r15)
0000000000308261	movl	$0x3, 0x1c(%r15)
0000000000308269	movabsq	$0x3ff0000000000000, %rcx       ## imm = 0x3FF0000000000000
0000000000308273	movq	%rcx, 0x98(%r15)
000000000030827a	movq	%rcx, 0x70(%r15)
000000000030827e	movq	%rcx, 0x48(%r15)
0000000000308282	movq	%rcx, 0x20(%r15)
0000000000308286	movups	%xmm0, 0x28(%r15)
000000000030828b	movups	%xmm0, 0x38(%r15)
0000000000308290	movups	%xmm0, 0x50(%r15)
0000000000308295	movups	%xmm0, 0x60(%r15)
000000000030829a	movups	%xmm0, 0x78(%r15)
000000000030829f	movups	%xmm0, 0x88(%r15)
00000000003082a7	addl	$0x2, %ebx
00000000003082aa	movl	%ebx, __ZN10PTTriangle9idCounterE(%rip) ## PTTriangle::idCounter
00000000003082b0	movl	%ebx, 0xa0(%r15)
00000000003082b7	movl	$0x0, 0xa4(%r15)
00000000003082c2	movq	(%r14), %rcx
00000000003082c5	movq	%rcx, (%r15)
00000000003082c8	movq	-0xb8(%rbp), %rcx
00000000003082cf	movq	(%rdx,%rcx,8), %rcx
00000000003082d3	movq	%rcx, 0x8(%r15)
00000000003082d7	movq	-0xb0(%rbp), %rcx
00000000003082de	movq	%rcx, 0x10(%r15)
00000000003082e2	movl	%eax, 0x18(%r15)
00000000003082e6	movl	0x18(%rdx), %eax
00000000003082e9	movl	%eax, 0x1c(%r15)
00000000003082ed	movl	$0x18, %edi
00000000003082f2	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003082f7	movq	%r12, 0x10(%rax)
00000000003082fb	movq	-0x90(%rbp), %rdx
0000000000308302	movq	(%rdx), %rcx
0000000000308305	movq	%rax, 0x8(%rcx)
0000000000308309	movq	%rcx, (%rax)
000000000030830c	movq	%rax, (%rdx)
000000000030830f	movq	%rdx, 0x8(%rax)
0000000000308313	movq	-0x58(%rbp), %rax
0000000000308317	movq	0x18(%rax), %rbx
000000000030831b	incq	%rbx
000000000030831e	movq	%rbx, 0x18(%rax)
0000000000308322	movl	$0x18, %edi
0000000000308327	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000030832c	movq	%r15, 0x10(%rax)
0000000000308330	movq	-0x90(%rbp), %rdi
0000000000308337	movq	(%rdi), %rcx
000000000030833a	movq	%rax, 0x8(%rcx)
000000000030833e	movq	%rcx, (%rax)
0000000000308341	movq	%rax, (%rdi)
0000000000308344	movq	%rdi, 0x8(%rax)
0000000000308348	movq	0x8(%rdi), %r15
000000000030834c	movq	%r15, -0xf0(%rbp)
0000000000308353	movq	%r15, 0x8(%rax)
0000000000308357	movq	%rax, (%r15)
000000000030835a	movq	-0x58(%rbp), %r12
000000000030835e	movq	%rbx, 0x18(%r12)
0000000000308363	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000308368	movslq	-0x110(%rbp), %rax
000000000030836f	movq	-0x70(%rbp), %rsi
0000000000308373	leaq	(%rsi,%rax,8), %rdx
0000000000308377	movslq	-0xe8(%rbp), %rax
000000000030837e	leaq	(%rsi,%rax,8), %rcx
0000000000308382	movq	%r12, %rdi
0000000000308385	leaq	-0xd0(%rbp), %r8
000000000030838c	leaq	-0xf0(%rbp), %r9
0000000000308393	callq	__ZN13OZVectorShape25subdivideAdjacentTriangleEPK10PTTriangleRK9PCVector2IfES6_S6_RNSt3__115__list_iteratorIPS0_PvEE ## OZVectorShape::subdivideAdjacentTriangle(PTTriangle const*, PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, std::__1::__list_iterator<PTTriangle*, void*>&)
0000000000308398	movq	%r15, -0x90(%rbp)
000000000030839f	jmp	0x308c50
00000000003083a4	testb	$0x1, %cl
00000000003083a7	je	0x3086f6
00000000003083ad	movl	$0xa8, %edi
00000000003083b2	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003083b7	movq	%rax, %r12
00000000003083ba	movslq	-0x110(%rbp), %rdi
00000000003083c1	movslq	-0x108(%rbp), %rax
00000000003083c8	movq	-0x70(%rbp), %rsi
00000000003083cc	movl	0x18(%rsi), %ecx
00000000003083cf	xorps	%xmm0, %xmm0
00000000003083d2	movups	%xmm0, (%r12)
00000000003083d7	movq	$0x0, 0x10(%r12)
00000000003083e0	movl	$0x3, 0x1c(%r12)
00000000003083e9	movq	%rbx, 0x98(%r12)
00000000003083f1	movq	%rbx, 0x70(%r12)
00000000003083f6	movq	%rbx, 0x48(%r12)
00000000003083fb	movq	%rbx, 0x20(%r12)
0000000000308400	movups	%xmm0, 0x28(%r12)
0000000000308406	movups	%xmm0, 0x38(%r12)
000000000030840c	movups	%xmm0, 0x50(%r12)
0000000000308412	movups	%xmm0, 0x60(%r12)
0000000000308418	movups	%xmm0, 0x78(%r12)
000000000030841e	movups	%xmm0, 0x88(%r12)
0000000000308427	movl	__ZN10PTTriangle9idCounterE(%rip), %ebx ## PTTriangle::idCounter
000000000030842d	leal	0x1(%rbx), %edx
0000000000308430	movl	%edx, __ZN10PTTriangle9idCounterE(%rip) ## PTTriangle::idCounter
0000000000308436	movl	%edx, 0xa0(%r12)
000000000030843e	movl	$0x0, 0xa4(%r12)
000000000030844a	movq	%rdi, -0xb8(%rbp)
0000000000308451	movq	(%rsi,%rdi,8), %rdx
0000000000308455	movq	%rdx, (%r12)
0000000000308459	movq	(%rsi,%rax,8), %rax
000000000030845d	movq	%rax, 0x8(%r12)
0000000000308462	movq	-0xc8(%rbp), %rax
0000000000308469	movq	%rax, -0xb0(%rbp)
0000000000308470	movq	%rax, 0x10(%r12)
0000000000308475	movl	%ecx, 0x18(%r12)
000000000030847a	movl	0x18(%r15,%r13), %eax
000000000030847f	movl	%eax, 0x1c(%r12)
0000000000308484	cmpq	%r12, -0x100(%rbp)
000000000030848b	je	0x308589
0000000000308491	movsd	0x20(%r15,%r13), %xmm0
0000000000308498	movsd	%xmm0, 0x20(%r12)
000000000030849f	movsd	0x28(%r15,%r13), %xmm0
00000000003084a6	movsd	%xmm0, 0x28(%r12)
00000000003084ad	movsd	0x30(%r15,%r13), %xmm0
00000000003084b4	movsd	%xmm0, 0x30(%r12)
00000000003084bb	movsd	0x38(%r15,%r13), %xmm0
00000000003084c2	movsd	%xmm0, 0x38(%r12)
00000000003084c9	movsd	0x40(%r15,%r13), %xmm0
00000000003084d0	movsd	%xmm0, 0x40(%r12)
00000000003084d7	movsd	0x48(%r15,%r13), %xmm0
00000000003084de	movsd	%xmm0, 0x48(%r12)
00000000003084e5	movsd	0x50(%r15,%r13), %xmm0
00000000003084ec	movsd	%xmm0, 0x50(%r12)
00000000003084f3	movsd	0x58(%r15,%r13), %xmm0
00000000003084fa	movsd	%xmm0, 0x58(%r12)
0000000000308501	movsd	0x60(%r15,%r13), %xmm0
0000000000308508	movsd	%xmm0, 0x60(%r12)
000000000030850f	movsd	0x68(%r15,%r13), %xmm0
0000000000308516	movsd	%xmm0, 0x68(%r12)
000000000030851d	movsd	0x70(%r15,%r13), %xmm0
0000000000308524	movsd	%xmm0, 0x70(%r12)
000000000030852b	movsd	0x78(%r15,%r13), %xmm0
0000000000308532	movsd	%xmm0, 0x78(%r12)
0000000000308539	movsd	0x80(%r15,%r13), %xmm0
0000000000308543	movsd	%xmm0, 0x80(%r12)
000000000030854d	movsd	0x88(%r15,%r13), %xmm0
0000000000308557	movsd	%xmm0, 0x88(%r12)
0000000000308561	movsd	0x90(%r15,%r13), %xmm0
000000000030856b	movsd	%xmm0, 0x90(%r12)
0000000000308575	movsd	0x98(%r15,%r13), %xmm0
000000000030857f	movsd	%xmm0, 0x98(%r12)
0000000000308589	movl	$0xa8, %edi
000000000030858e	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000308593	movq	-0xa0(%rbp), %r14
000000000030859a	movq	%rax, %r15
000000000030859d	movq	-0x70(%rbp), %rdx
00000000003085a1	movl	0x18(%rdx), %eax
00000000003085a4	xorps	%xmm0, %xmm0
00000000003085a7	movups	%xmm0, (%r15)
00000000003085ab	movq	$0x0, 0x10(%r15)
00000000003085b3	movl	$0x3, 0x1c(%r15)
00000000003085bb	movabsq	$0x3ff0000000000000, %rcx       ## imm = 0x3FF0000000000000
00000000003085c5	movq	%rcx, 0x98(%r15)
00000000003085cc	movq	%rcx, 0x70(%r15)
00000000003085d0	movq	%rcx, 0x48(%r15)
00000000003085d4	movq	%rcx, 0x20(%r15)
00000000003085d8	movups	%xmm0, 0x28(%r15)
00000000003085dd	movups	%xmm0, 0x38(%r15)
00000000003085e2	movups	%xmm0, 0x50(%r15)
00000000003085e7	movups	%xmm0, 0x60(%r15)
00000000003085ec	movups	%xmm0, 0x78(%r15)
00000000003085f1	movups	%xmm0, 0x88(%r15)
00000000003085f9	addl	$0x2, %ebx
00000000003085fc	movl	%ebx, __ZN10PTTriangle9idCounterE(%rip) ## PTTriangle::idCounter
0000000000308602	movl	%ebx, 0xa0(%r15)
0000000000308609	movl	$0x0, 0xa4(%r15)
0000000000308614	movq	(%r14), %rcx
0000000000308617	movq	%rcx, (%r15)
000000000030861a	movq	-0xb8(%rbp), %rcx
0000000000308621	movq	(%rdx,%rcx,8), %rcx
0000000000308625	movq	%rcx, 0x8(%r15)
0000000000308629	movq	-0xb0(%rbp), %rcx
0000000000308630	movq	%rcx, 0x10(%r15)
0000000000308634	movl	%eax, 0x18(%r15)
0000000000308638	movl	0x18(%rdx), %eax
000000000030863b	movl	%eax, 0x1c(%r15)
000000000030863f	movl	$0x18, %edi
0000000000308644	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000308649	movq	%r12, 0x10(%rax)
000000000030864d	movq	-0x90(%rbp), %rdx
0000000000308654	movq	(%rdx), %rcx
0000000000308657	movq	%rax, 0x8(%rcx)
000000000030865b	movq	%rcx, (%rax)
000000000030865e	movq	%rax, (%rdx)
0000000000308661	movq	%rdx, 0x8(%rax)
0000000000308665	movq	-0x58(%rbp), %rax
0000000000308669	movq	0x18(%rax), %rbx
000000000030866d	incq	%rbx
0000000000308670	movq	%rbx, 0x18(%rax)
0000000000308674	movl	$0x18, %edi
0000000000308679	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000030867e	movq	%r15, 0x10(%rax)
0000000000308682	movq	-0x90(%rbp), %rdi
0000000000308689	movq	(%rdi), %rcx
000000000030868c	movq	%rax, 0x8(%rcx)
0000000000308690	movq	%rcx, (%rax)
0000000000308693	movq	%rax, (%rdi)
0000000000308696	movq	%rdi, 0x8(%rax)
000000000030869a	movq	0x8(%rdi), %r15
000000000030869e	movq	%r15, -0xf0(%rbp)
00000000003086a5	movq	%r15, 0x8(%rax)
00000000003086a9	movq	%rax, (%r15)
00000000003086ac	movq	-0x58(%rbp), %r12
00000000003086b0	movq	%rbx, 0x18(%r12)
00000000003086b5	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003086ba	movslq	-0x108(%rbp), %rax
00000000003086c1	movq	-0x70(%rbp), %rsi
00000000003086c5	leaq	(%rsi,%rax,8), %rdx
00000000003086c9	movslq	-0xe8(%rbp), %rax
00000000003086d0	leaq	(%rsi,%rax,8), %rcx
00000000003086d4	movq	%r12, %rdi
00000000003086d7	leaq	-0xc8(%rbp), %r8
00000000003086de	leaq	-0xf0(%rbp), %r9
00000000003086e5	callq	__ZN13OZVectorShape25subdivideAdjacentTriangleEPK10PTTriangleRK9PCVector2IfES6_S6_RNSt3__115__list_iteratorIPS0_PvEE ## OZVectorShape::subdivideAdjacentTriangle(PTTriangle const*, PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, std::__1::__list_iterator<PTTriangle*, void*>&)
00000000003086ea	movq	%r15, -0x90(%rbp)
00000000003086f1	jmp	0x308c50
00000000003086f6	movl	$0xa8, %edi
00000000003086fb	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000308700	movslq	-0x110(%rbp), %rbx
0000000000308707	movslq	-0x108(%rbp), %rsi
000000000030870e	movq	-0x70(%rbp), %rdx
0000000000308712	movl	0x18(%rdx), %edi
0000000000308715	xorps	%xmm0, %xmm0
0000000000308718	movups	%xmm0, (%rax)
000000000030871b	movq	$0x0, 0x10(%rax)
0000000000308723	movl	$0x3, 0x1c(%rax)
000000000030872a	movabsq	$0x3ff0000000000000, %rcx       ## imm = 0x3FF0000000000000
0000000000308734	movq	%rcx, 0x98(%rax)
000000000030873b	movq	%rcx, 0x70(%rax)
000000000030873f	movq	%rcx, 0x48(%rax)
0000000000308743	movq	%rcx, 0x20(%rax)
0000000000308747	movups	%xmm0, 0x28(%rax)
000000000030874b	movups	%xmm0, 0x38(%rax)
000000000030874f	movups	%xmm0, 0x50(%rax)
0000000000308753	movups	%xmm0, 0x60(%rax)
0000000000308757	movups	%xmm0, 0x78(%rax)
000000000030875b	movups	%xmm0, 0x88(%rax)
0000000000308762	movl	__ZN10PTTriangle9idCounterE(%rip), %ecx ## PTTriangle::idCounter
0000000000308768	movq	%rcx, -0xb8(%rbp)
000000000030876f	leal	0x1(%rcx), %ecx
0000000000308772	movl	%ecx, __ZN10PTTriangle9idCounterE(%rip) ## PTTriangle::idCounter
0000000000308778	movl	%ecx, 0xa0(%rax)
000000000030877e	movl	$0x0, 0xa4(%rax)
0000000000308788	movq	(%rdx,%rbx,8), %rcx
000000000030878c	movq	%rcx, (%rax)
000000000030878f	movq	%rsi, -0xc0(%rbp)
0000000000308796	movq	(%rdx,%rsi,8), %rcx
000000000030879a	movq	%rcx, 0x8(%rax)
000000000030879e	movq	-0xc8(%rbp), %rcx
00000000003087a5	movq	%rcx, -0xb0(%rbp)
00000000003087ac	movq	%rcx, 0x10(%rax)
00000000003087b0	movl	%edi, 0x18(%rax)
00000000003087b3	movl	0x18(%r15,%r13), %ecx
00000000003087b8	movl	%ecx, 0x1c(%rax)
00000000003087bb	cmpq	%rax, -0x100(%rbp)
00000000003087c2	je	0x3088a0
00000000003087c8	movsd	0x20(%r15,%r13), %xmm0
00000000003087cf	movsd	%xmm0, 0x20(%rax)
00000000003087d4	movsd	0x28(%r15,%r13), %xmm0
00000000003087db	movsd	%xmm0, 0x28(%rax)
00000000003087e0	movsd	0x30(%r15,%r13), %xmm0
00000000003087e7	movsd	%xmm0, 0x30(%rax)
00000000003087ec	movsd	0x38(%r15,%r13), %xmm0
00000000003087f3	movsd	%xmm0, 0x38(%rax)
00000000003087f8	movsd	0x40(%r15,%r13), %xmm0
00000000003087ff	movsd	%xmm0, 0x40(%rax)
0000000000308804	movsd	0x48(%r15,%r13), %xmm0
000000000030880b	movsd	%xmm0, 0x48(%rax)
0000000000308810	movsd	0x50(%r15,%r13), %xmm0
0000000000308817	movsd	%xmm0, 0x50(%rax)
000000000030881c	movsd	0x58(%r15,%r13), %xmm0
0000000000308823	movsd	%xmm0, 0x58(%rax)
0000000000308828	movsd	0x60(%r15,%r13), %xmm0
000000000030882f	movsd	%xmm0, 0x60(%rax)
0000000000308834	movsd	0x68(%r15,%r13), %xmm0
000000000030883b	movsd	%xmm0, 0x68(%rax)
0000000000308840	movsd	0x70(%r15,%r13), %xmm0
0000000000308847	movsd	%xmm0, 0x70(%rax)
000000000030884c	movsd	0x78(%r15,%r13), %xmm0
0000000000308853	movsd	%xmm0, 0x78(%rax)
0000000000308858	movsd	0x80(%r15,%r13), %xmm0
0000000000308862	movsd	%xmm0, 0x80(%rax)
000000000030886a	movsd	0x88(%r15,%r13), %xmm0
0000000000308874	movsd	%xmm0, 0x88(%rax)
000000000030887c	movsd	0x90(%r15,%r13), %xmm0
0000000000308886	movsd	%xmm0, 0x90(%rax)
000000000030888e	movsd	0x98(%r15,%r13), %xmm0
0000000000308898	movsd	%xmm0, 0x98(%rax)
00000000003088a0	movq	%rax, -0x118(%rbp)
00000000003088a7	movl	$0xa8, %edi
00000000003088ac	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003088b1	movq	%rax, %r12
00000000003088b4	movq	-0x70(%rbp), %rax
00000000003088b8	leaq	(%rax,%rbx,8), %rdx
00000000003088bc	movl	0x18(%rax), %eax
00000000003088bf	xorps	%xmm0, %xmm0
00000000003088c2	movups	%xmm0, (%r12)
00000000003088c7	movq	$0x0, 0x10(%r12)
00000000003088d0	movl	$0x3, 0x1c(%r12)
00000000003088d9	movabsq	$0x3ff0000000000000, %rcx       ## imm = 0x3FF0000000000000
00000000003088e3	movq	%rcx, 0x98(%r12)
00000000003088eb	movq	%rcx, 0x70(%r12)
00000000003088f0	movq	%rcx, 0x48(%r12)
00000000003088f5	movq	%rcx, 0x20(%r12)
00000000003088fa	movups	%xmm0, 0x28(%r12)
0000000000308900	movups	%xmm0, 0x38(%r12)
0000000000308906	movups	%xmm0, 0x50(%r12)
000000000030890c	movups	%xmm0, 0x60(%r12)
0000000000308912	movups	%xmm0, 0x78(%r12)
0000000000308918	movups	%xmm0, 0x88(%r12)
0000000000308921	movq	-0xb8(%rbp), %rcx
0000000000308928	leal	0x2(%rcx), %ecx
000000000030892b	movl	%ecx, __ZN10PTTriangle9idCounterE(%rip) ## PTTriangle::idCounter
0000000000308931	movl	%ecx, 0xa0(%r12)
0000000000308939	movl	$0x0, 0xa4(%r12)
0000000000308945	movq	%rdx, -0x150(%rbp)
000000000030894c	movq	(%rdx), %rcx
000000000030894f	movq	%rcx, (%r12)
0000000000308953	movq	-0xd0(%rbp), %rbx
000000000030895a	movq	%rbx, 0x8(%r12)
000000000030895f	movq	-0xb0(%rbp), %rcx
0000000000308966	movq	%rcx, 0x10(%r12)
000000000030896b	movl	%eax, 0x18(%r12)
0000000000308970	movl	0x18(%r15,%r13), %eax
0000000000308975	movl	%eax, 0x1c(%r12)
000000000030897a	cmpq	%r12, -0x100(%rbp)
0000000000308981	je	0x308a7f
0000000000308987	movsd	0x20(%r15,%r13), %xmm0
000000000030898e	movsd	%xmm0, 0x20(%r12)
0000000000308995	movsd	0x28(%r15,%r13), %xmm0
000000000030899c	movsd	%xmm0, 0x28(%r12)
00000000003089a3	movsd	0x30(%r15,%r13), %xmm0
00000000003089aa	movsd	%xmm0, 0x30(%r12)
00000000003089b1	movsd	0x38(%r15,%r13), %xmm0
00000000003089b8	movsd	%xmm0, 0x38(%r12)
00000000003089bf	movsd	0x40(%r15,%r13), %xmm0
00000000003089c6	movsd	%xmm0, 0x40(%r12)
00000000003089cd	movsd	0x48(%r15,%r13), %xmm0
00000000003089d4	movsd	%xmm0, 0x48(%r12)
00000000003089db	movsd	0x50(%r15,%r13), %xmm0
00000000003089e2	movsd	%xmm0, 0x50(%r12)
00000000003089e9	movsd	0x58(%r15,%r13), %xmm0
00000000003089f0	movsd	%xmm0, 0x58(%r12)
00000000003089f7	movsd	0x60(%r15,%r13), %xmm0
00000000003089fe	movsd	%xmm0, 0x60(%r12)
0000000000308a05	movsd	0x68(%r15,%r13), %xmm0
0000000000308a0c	movsd	%xmm0, 0x68(%r12)
0000000000308a13	movsd	0x70(%r15,%r13), %xmm0
0000000000308a1a	movsd	%xmm0, 0x70(%r12)
0000000000308a21	movsd	0x78(%r15,%r13), %xmm0
0000000000308a28	movsd	%xmm0, 0x78(%r12)
0000000000308a2f	movsd	0x80(%r15,%r13), %xmm0
0000000000308a39	movsd	%xmm0, 0x80(%r12)
0000000000308a43	movsd	0x88(%r15,%r13), %xmm0
0000000000308a4d	movsd	%xmm0, 0x88(%r12)
0000000000308a57	movsd	0x90(%r15,%r13), %xmm0
0000000000308a61	movsd	%xmm0, 0x90(%r12)
0000000000308a6b	movsd	0x98(%r15,%r13), %xmm0
0000000000308a75	movsd	%xmm0, 0x98(%r12)
0000000000308a7f	movl	$0xa8, %edi
0000000000308a84	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000308a89	movq	-0x58(%rbp), %r14
0000000000308a8d	movq	%rax, %r15
0000000000308a90	movq	-0x70(%rbp), %rdx
0000000000308a94	movl	0x18(%rdx), %eax
0000000000308a97	xorps	%xmm0, %xmm0
0000000000308a9a	movups	%xmm0, (%r15)
0000000000308a9e	movq	$0x0, 0x10(%r15)
0000000000308aa6	movl	$0x3, 0x1c(%r15)
0000000000308aae	movabsq	$0x3ff0000000000000, %rcx       ## imm = 0x3FF0000000000000
0000000000308ab8	movq	%rcx, 0x98(%r15)
0000000000308abf	movq	%rcx, 0x70(%r15)
0000000000308ac3	movq	%rcx, 0x48(%r15)
0000000000308ac7	movq	%rcx, 0x20(%r15)
0000000000308acb	movups	%xmm0, 0x28(%r15)
0000000000308ad0	movups	%xmm0, 0x38(%r15)
0000000000308ad5	movups	%xmm0, 0x50(%r15)
0000000000308ada	movups	%xmm0, 0x60(%r15)
0000000000308adf	movups	%xmm0, 0x78(%r15)
0000000000308ae4	movups	%xmm0, 0x88(%r15)
0000000000308aec	movq	-0xb8(%rbp), %rcx
0000000000308af3	addl	$0x3, %ecx
0000000000308af6	movl	%ecx, __ZN10PTTriangle9idCounterE(%rip) ## PTTriangle::idCounter
0000000000308afc	movl	%ecx, 0xa0(%r15)
0000000000308b03	movl	$0x0, 0xa4(%r15)
0000000000308b0e	movq	-0xa0(%rbp), %rcx
0000000000308b15	movq	(%rcx), %rcx
0000000000308b18	movq	%rcx, (%r15)
0000000000308b1b	movq	%rbx, 0x8(%r15)
0000000000308b1f	movq	-0xb0(%rbp), %rcx
0000000000308b26	movq	%rcx, 0x10(%r15)
0000000000308b2a	movl	%eax, 0x18(%r15)
0000000000308b2e	movl	0x18(%rdx), %eax
0000000000308b31	movl	%eax, 0x1c(%r15)
0000000000308b35	movl	$0x18, %edi
0000000000308b3a	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000308b3f	movq	-0x118(%rbp), %rcx
0000000000308b46	movq	%rcx, 0x10(%rax)
0000000000308b4a	movq	-0x90(%rbp), %rdx
0000000000308b51	movq	(%rdx), %rcx
0000000000308b54	movq	%rax, 0x8(%rcx)
0000000000308b58	movq	%rcx, (%rax)
0000000000308b5b	movq	%rax, (%rdx)
0000000000308b5e	movq	%rdx, 0x8(%rax)
0000000000308b62	movq	0x18(%r14), %rbx
0000000000308b66	leaq	0x1(%rbx), %rax
0000000000308b6a	movq	%rax, 0x18(%r14)
0000000000308b6e	movl	$0x18, %edi
0000000000308b73	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000308b78	movq	%r12, 0x10(%rax)
0000000000308b7c	movq	-0x90(%rbp), %rdx
0000000000308b83	movq	(%rdx), %rcx
0000000000308b86	movq	%rax, 0x8(%rcx)
0000000000308b8a	movq	%rcx, (%rax)
0000000000308b8d	movq	%rax, (%rdx)
0000000000308b90	movq	%rdx, 0x8(%rax)
0000000000308b94	leaq	0x2(%rbx), %rax
0000000000308b98	movq	%rax, 0x18(%r14)
0000000000308b9c	movl	$0x18, %edi
0000000000308ba1	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000308ba6	movq	%r15, 0x10(%rax)
0000000000308baa	movq	-0x90(%rbp), %rdx
0000000000308bb1	movq	(%rdx), %rcx
0000000000308bb4	movq	%rax, 0x8(%rcx)
0000000000308bb8	movq	%rcx, (%rax)
0000000000308bbb	movq	%rax, (%rdx)
0000000000308bbe	movq	%rdx, 0x8(%rax)
0000000000308bc2	addq	$0x3, %rbx
0000000000308bc6	movq	%rbx, 0x18(%r14)
0000000000308bca	movq	%r14, %rdi
0000000000308bcd	movq	-0x70(%rbp), %rsi
0000000000308bd1	movq	-0x150(%rbp), %rdx
0000000000308bd8	movq	-0xa0(%rbp), %rcx
0000000000308bdf	leaq	-0xd0(%rbp), %r8
0000000000308be6	leaq	-0xf0(%rbp), %r9
0000000000308bed	callq	__ZN13OZVectorShape25subdivideAdjacentTriangleEPK10PTTriangleRK9PCVector2IfES6_S6_RNSt3__115__list_iteratorIPS0_PvEE ## OZVectorShape::subdivideAdjacentTriangle(PTTriangle const*, PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, std::__1::__list_iterator<PTTriangle*, void*>&)
0000000000308bf2	movq	-0x70(%rbp), %rsi
0000000000308bf6	movq	-0xc0(%rbp), %rax
0000000000308bfd	leaq	(%rsi,%rax,8), %rdx
0000000000308c01	movq	%r14, %rdi
0000000000308c04	movq	-0xa0(%rbp), %rcx
0000000000308c0b	leaq	-0xc8(%rbp), %r8
0000000000308c12	leaq	-0xf0(%rbp), %r9
0000000000308c19	callq	__ZN13OZVectorShape25subdivideAdjacentTriangleEPK10PTTriangleRK9PCVector2IfES6_S6_RNSt3__115__list_iteratorIPS0_PvEE ## OZVectorShape::subdivideAdjacentTriangle(PTTriangle const*, PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, std::__1::__list_iterator<PTTriangle*, void*>&)
0000000000308c1e	movq	-0x90(%rbp), %rdi
0000000000308c25	movq	0x8(%rdi), %rbx
0000000000308c29	movq	%rbx, -0xf0(%rbp)
0000000000308c30	movq	(%rdi), %rax
0000000000308c33	movq	%rbx, 0x8(%rax)
0000000000308c37	movq	%rax, (%rbx)
0000000000308c3a	decq	0x18(%r14)
0000000000308c3e	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000308c43	movq	%rbx, -0x90(%rbp)
0000000000308c4a	nopw	(%rax,%rax)
0000000000308c50	movq	-0x78(%rbp), %rcx
0000000000308c54	movq	-0x58(%rbp), %rax
0000000000308c58	movl	0xc0(%rax), %ebx
0000000000308c5e	movb	$0x1, %al
0000000000308c60	movq	%rax, -0xa0(%rbp)
0000000000308c67	jmp	0x307854
0000000000308c6c	nopl	(%rax)
0000000000308c70	movslq	-0x11c(%rbp), %rax
0000000000308c77	movslq	-0x7c(%rbp), %rcx
0000000000308c7b	movslq	-0x120(%rbp), %rdx
0000000000308c82	movq	-0x70(%rbp), %rsi
0000000000308c86	movsd	(%rsi,%rcx,8), %xmm4
0000000000308c8b	movsd	%xmm4, -0xd0(%rbp)
0000000000308c93	movsd	(%rsi,%rdx,8), %xmm1
0000000000308c98	movsd	%xmm1, -0xc8(%rbp)
0000000000308ca0	movsd	(%rsi,%rax,8), %xmm7
0000000000308ca5	movsd	%xmm7, -0x50(%rbp)
0000000000308caa	movaps	%xmm4, %xmm2
0000000000308cad	subps	%xmm7, %xmm2
0000000000308cb0	movaps	%xmm1, %xmm3
0000000000308cb3	subps	%xmm7, %xmm3
0000000000308cb6	movaps	%xmm2, %xmm0
0000000000308cb9	mulps	%xmm3, %xmm0
0000000000308cbc	movshdup	%xmm0, %xmm5                    ## xmm5 = xmm0[1,1,3,3]
0000000000308cc0	addss	%xmm0, %xmm5
0000000000308cc4	xorps	%xmm11, %xmm11
0000000000308cc8	ucomiss	%xmm11, %xmm5
0000000000308ccc	movq	-0x90(%rbp), %rbx
0000000000308cd3	jne	0x308cd7
0000000000308cd5	jnp	0x308cf8
0000000000308cd7	subps	%xmm4, %xmm1
0000000000308cda	movaps	%xmm2, %xmm0
0000000000308cdd	mulps	%xmm1, %xmm0
0000000000308ce0	movshdup	%xmm0, %xmm5                    ## xmm5 = xmm0[1,1,3,3]
0000000000308ce4	addss	%xmm0, %xmm5
0000000000308ce8	ucomiss	%xmm11, %xmm5
0000000000308cec	jne	0x309191
0000000000308cf2	jp	0x309191
0000000000308cf8	movq	-0x50(%rbp), %rcx
0000000000308cfc	movq	%rcx, (%rsi)
0000000000308cff	movq	-0xc8(%rbp), %rax
0000000000308d06	movq	%rax, 0x8(%rsi)
0000000000308d0a	movq	-0xd0(%rbp), %rdx
0000000000308d11	movq	%rdx, 0x10(%rsi)
0000000000308d15	movl	$0x4, 0x1c(%rsi)
0000000000308d1c	movd	%ecx, %xmm2
0000000000308d20	shrq	$0x20, %rcx
0000000000308d24	movd	%ecx, %xmm3
0000000000308d28	movq	%rax, %rcx
0000000000308d2b	shrq	$0x20, %rcx
0000000000308d2f	movd	%ecx, %xmm5
0000000000308d33	movdqa	%xmm5, %xmm8
0000000000308d38	pinsrd	$0x1, %edx, %xmm8
0000000000308d3f	shrq	$0x20, %rdx
0000000000308d43	movd	%edx, %xmm0
0000000000308d47	movd	%edx, %xmm6
0000000000308d4b	movdqa	%xmm5, %xmm1
0000000000308d4f	subss	%xmm0, %xmm1
0000000000308d53	pinsrd	$0x1, %eax, %xmm0
0000000000308d59	movd	%ecx, %xmm4
0000000000308d5d	mulss	%xmm2, %xmm1
0000000000308d61	subps	%xmm8, %xmm0
0000000000308d65	movshdup	%xmm0, %xmm9                    ## xmm9 = xmm0[1,1,3,3]
0000000000308d6a	mulss	%xmm3, %xmm9
0000000000308d6f	movd	%eax, %xmm7
0000000000308d73	mulss	%xmm7, %xmm6
0000000000308d77	pshufd	$0xf5, %xmm8, %xmm8             ## xmm8 = xmm8[1,1,3,3]
0000000000308d7d	mulss	%xmm5, %xmm8
0000000000308d82	insertps	$0x10, %xmm3, %xmm1             ## xmm1 = xmm1[0],xmm3[0],xmm1[2,3]
0000000000308d88	mulss	%xmm7, %xmm3
0000000000308d8c	subss	%xmm2, %xmm7
0000000000308d90	mulss	%xmm2, %xmm4
0000000000308d94	subss	%xmm3, %xmm4
0000000000308d98	movq	$0x0, 0x30(%rsi)
0000000000308da0	insertps	$0x1c, %xmm5, %xmm9             ## xmm9 = xmm9[0],xmm5[0],zero,zero
0000000000308da7	subps	%xmm9, %xmm1
0000000000308dab	addss	%xmm1, %xmm6
0000000000308daf	subss	%xmm8, %xmm6
0000000000308db4	movss	0x3fe194(%rip), %xmm2
0000000000308dbc	divss	%xmm6, %xmm2
0000000000308dc0	movsldup	%xmm2, %xmm3                    ## xmm3 = xmm2[0,0,2,2]
0000000000308dc4	mulps	%xmm3, %xmm0
0000000000308dc7	mulps	%xmm3, %xmm1
0000000000308dca	mulss	%xmm2, %xmm7
0000000000308dce	mulss	%xmm4, %xmm2
0000000000308dd2	cvtps2pd	%xmm0, %xmm0
0000000000308dd5	movups	%xmm0, 0x20(%rsi)
0000000000308dd9	cvtps2pd	%xmm1, %xmm0
0000000000308ddc	movups	%xmm0, 0x38(%rsi)
0000000000308de0	xorps	%xmm0, %xmm0
0000000000308de3	cvtss2sd	%xmm7, %xmm0
0000000000308de7	movsd	%xmm0, 0x48(%rsi)
0000000000308dec	movq	$0x0, 0x50(%rsi)
0000000000308df4	xorps	%xmm0, %xmm0
0000000000308df7	cvtss2sd	%xmm2, %xmm0
0000000000308dfb	movsd	%xmm0, 0x58(%rsi)
0000000000308e00	xorps	%xmm0, %xmm0
0000000000308e03	movups	%xmm0, 0x60(%rsi)
0000000000308e07	movups	%xmm0, 0x70(%rsi)
0000000000308e0b	movups	%xmm0, 0x80(%rsi)
0000000000308e12	movq	$0x0, 0x90(%rsi)
0000000000308e1d	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
0000000000308e27	movq	%rax, 0x98(%rsi)
0000000000308e2e	movq	-0x58(%rbp), %r14
0000000000308e32	leaq	-0x7c(%rbp), %r13
0000000000308e36	movq	-0xe0(%rbp), %r15
0000000000308e3d	jmp	0x307773
0000000000308e42	testb	$0x1, -0xa0(%rbp)
0000000000308e49	je	0x308f2c
0000000000308e4f	movq	-0x58(%rbp), %r14
0000000000308e53	movq	-0xe0(%rbp), %r15
0000000000308e5a	leaq	-0x7c(%rbp), %r13
0000000000308e5e	movq	-0x90(%rbp), %rbx
0000000000308e65	jmp	0x307773
0000000000308e6a	movl	$0x0, -0x50(%rbp)
0000000000308e71	xorl	%r8d, %r8d
0000000000308e74	xorl	%r12d, %r12d
0000000000308e77	movabsq	$0x3ff0000000000000, %rdi       ## imm = 0x3FF0000000000000
0000000000308e81	movq	-0x90(%rbp), %rbx
0000000000308e88	movq	-0xe0(%rbp), %r15
0000000000308e8f	subq	%r8, %r12
0000000000308e92	cmpq	$0x9, %r12
0000000000308e96	jb	0x309183
0000000000308e9c	movslq	-0x50(%rbp), %rax
0000000000308ea0	leal	0x1(%rax), %ecx
0000000000308ea3	movslq	%ecx, %rcx
0000000000308ea6	imulq	$0x55555556, %rcx, %rdx         ## imm = 0x55555556
0000000000308ead	movq	%rdx, %rsi
0000000000308eb0	shrq	$0x3f, %rsi
0000000000308eb4	shrq	$0x20, %rdx
0000000000308eb8	addl	%esi, %edx
0000000000308eba	leal	(%rdx,%rdx,2), %edx
0000000000308ebd	subl	%edx, %ecx
0000000000308ebf	movslq	%ecx, %rcx
0000000000308ec2	movq	(%r8), %rdx
0000000000308ec5	movq	%r8, %r9
0000000000308ec8	movq	0x8(%r8), %rsi
0000000000308ecc	movsd	0x8(%rdx), %xmm4
0000000000308ed1	movshdup	%xmm4, %xmm2                    ## xmm2 = xmm4[1,1,3,3]
0000000000308ed5	movq	-0x70(%rbp), %rdx
0000000000308ed9	movsd	(%rdx,%rax,8), %xmm7
0000000000308ede	movsd	(%rdx,%rcx,8), %xmm0
0000000000308ee3	subps	%xmm7, %xmm0
0000000000308ee6	shufps	$0xe1, %xmm0, %xmm0             ## xmm0 = xmm0[1,0,2,3]
0000000000308eea	subps	%xmm4, %xmm7
0000000000308eed	mulps	%xmm0, %xmm7
0000000000308ef0	movshdup	%xmm7, %xmm0                    ## xmm0 = xmm7[1,1,3,3]
0000000000308ef4	ucomiss	%xmm0, %xmm7
0000000000308ef7	movsd	0x8(%rsi), %xmm1
0000000000308efc	movaps	%xmm1, %xmm5
0000000000308eff	addps	%xmm4, %xmm5
0000000000308f02	mulps	0x3fdef7(%rip), %xmm5
0000000000308f09	movshdup	%xmm1, %xmm8                    ## xmm8 = xmm1[1,1,3,3]
0000000000308f0e	movaps	%xmm8, %xmm3
0000000000308f12	ja	0x308f17
0000000000308f14	movaps	%xmm2, %xmm3
0000000000308f17	movaps	%xmm1, %xmm6
0000000000308f1a	ja	0x30765c
0000000000308f20	movaps	%xmm4, %xmm6
0000000000308f23	movaps	%xmm8, %xmm2
0000000000308f27	jmp	0x30765c
0000000000308f2c	movl	$0x0, -0x50(%rbp)
0000000000308f33	testl	%ebx, %ebx
0000000000308f35	je	0x309154
0000000000308f3b	movl	%ebx, -0xa0(%rbp)
0000000000308f41	xorl	%r13d, %r13d
0000000000308f44	xorl	%r15d, %r15d
0000000000308f47	movq	$0x0, -0x100(%rbp)
0000000000308f52	xorl	%r12d, %r12d
0000000000308f55	movq	$0x0, -0x78(%rbp)
0000000000308f5d	jmp	0x308f7c
0000000000308f5f	nop
0000000000308f60	movq	%r8, %r12
0000000000308f63	incq	%r15
0000000000308f66	movl	-0xa0(%rbp), %eax
0000000000308f6c	addq	$0xa8, %r13
0000000000308f73	cmpq	%rax, %r15
0000000000308f76	jae	0x309144
0000000000308f7c	movq	-0x58(%rbp), %rax
0000000000308f80	movq	0xc8(%rax), %rbx
0000000000308f87	leaq	(%rbx,%r13), %rsi
0000000000308f8b	movq	-0x70(%rbp), %rdi
0000000000308f8f	movq	%rsi, %r14
0000000000308f92	leaq	-0x50(%rbp), %rdx
0000000000308f96	callq	__ZNK10PTTriangle14vertexAdjacentERKS_Ri ## PTTriangle::vertexAdjacent(PTTriangle const&, int&) const
0000000000308f9b	movq	-0x78(%rbp), %r8
0000000000308f9f	cmpq	%r12, %r8
0000000000308fa2	je	0x309090
0000000000308fa8	testb	%al, %al
0000000000308faa	je	0x308f60
0000000000308fac	movq	(%r8), %rax
0000000000308faf	movsd	0x10(%rax), %xmm2
0000000000308fb4	movsd	(%r14), %xmm1
0000000000308fb9	movaps	%xmm2, %xmm0
0000000000308fbc	subps	%xmm1, %xmm0
0000000000308fbf	movaps	0x3febfa(%rip), %xmm4
0000000000308fc6	andps	%xmm4, %xmm0
0000000000308fc9	movaps	0x3ff570(%rip), %xmm5
0000000000308fd0	cmpltps	%xmm5, %xmm0
0000000000308fd4	unpcklps	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,1,1]
0000000000308fd7	movmskpd	%xmm0, %ecx
0000000000308fdb	cmpl	$0x3, %ecx
0000000000308fde	jne	0x308f60
0000000000308fe0	movslq	-0x50(%rbp), %rcx
0000000000308fe4	movq	-0x70(%rbp), %rdx
0000000000308fe8	movsd	(%rdx,%rcx,8), %xmm0
0000000000308fed	movaps	%xmm0, %xmm3
0000000000308ff0	subps	%xmm2, %xmm3
0000000000308ff3	andps	%xmm4, %xmm3
0000000000308ff6	cmpltps	%xmm5, %xmm3
0000000000308ffa	unpcklps	%xmm3, %xmm3                    ## xmm3 = xmm3[0,0,1,1]
0000000000308ffd	movmskpd	%xmm3, %ecx
0000000000309001	cmpl	$0x3, %ecx
0000000000309004	jne	0x308f60
000000000030900a	movaps	%xmm0, %xmm2
000000000030900d	subps	%xmm1, %xmm2
0000000000309010	andps	%xmm4, %xmm2
0000000000309013	cmpltps	%xmm5, %xmm2
0000000000309017	unpcklps	%xmm2, %xmm2                    ## xmm2 = xmm2[0,0,1,1]
000000000030901a	movmskpd	%xmm2, %ecx
000000000030901e	cmpl	$0x3, %ecx
0000000000309021	jne	0x308f60
0000000000309027	movsd	0x8(%rax), %xmm2
000000000030902c	movsd	0x8(%rbx,%r13), %xmm1
0000000000309033	subps	%xmm2, %xmm1
0000000000309036	subps	%xmm2, %xmm0
0000000000309039	movaps	%xmm1, %xmm2
000000000030903c	shufps	$0xe1, %xmm1, %xmm2             ## xmm2 = xmm2[1,0],xmm1[2,3]
0000000000309040	mulps	%xmm0, %xmm2
0000000000309043	movshdup	%xmm2, %xmm3                    ## xmm3 = xmm2[1,1,3,3]
0000000000309047	subss	%xmm3, %xmm2
000000000030904b	andps	%xmm4, %xmm2
000000000030904e	cvtss2sd	%xmm2, %xmm2
0000000000309052	ucomisd	0x3feafe(%rip), %xmm2
000000000030905a	ja	0x308f60
0000000000309060	mulps	%xmm1, %xmm0
0000000000309063	movshdup	%xmm0, %xmm2                    ## xmm2 = xmm0[1,1,3,3]
0000000000309067	addps	%xmm0, %xmm2
000000000030906a	xorps	%xmm0, %xmm0
000000000030906d	ucomiss	%xmm2, %xmm0
0000000000309070	ja	0x308f60
0000000000309076	mulps	%xmm1, %xmm1
0000000000309079	movshdup	%xmm1, %xmm0                    ## xmm0 = xmm1[1,1,3,3]
000000000030907d	addss	%xmm1, %xmm0
0000000000309081	ucomiss	%xmm0, %xmm2
0000000000309084	ja	0x308f60
000000000030908a	jmp	0x3098e9
000000000030908f	nop
0000000000309090	testb	%al, %al
0000000000309092	je	0x308f63
0000000000309098	movq	%r12, %rax
000000000030909b	movq	-0x100(%rbp), %rcx
00000000003090a2	cmpq	%rcx, %r12
00000000003090a5	jae	0x3090b6
00000000003090a7	movq	%r14, (%rax)
00000000003090aa	addq	$0x8, %rax
00000000003090ae	movq	%rax, %r12
00000000003090b1	jmp	0x308f63
00000000003090b6	subq	%rax, %rcx
00000000003090b9	movq	%rcx, %rbx
00000000003090bc	sarq	$0x2, %rbx
00000000003090c0	cmpq	$0x1, %rbx
00000000003090c4	adcq	$0x0, %rbx
00000000003090c8	movabsq	$0x7ffffffffffffff8, %rax       ## imm = 0x7FFFFFFFFFFFFFF8
00000000003090d2	cmpq	%rax, %rcx
00000000003090d5	movabsq	$0x1fffffffffffffff, %rax       ## imm = 0x1FFFFFFFFFFFFFFF
00000000003090df	cmovaeq	%rax, %rbx
00000000003090e3	cmpq	%rax, %rbx
00000000003090e6	ja	0x309a14
00000000003090ec	leaq	(,%rbx,8), %rdi
00000000003090f4	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003090f9	movq	%rax, %rcx
00000000003090fc	leaq	(%rax,%rbx,8), %rax
0000000000309100	movq	%rax, -0x100(%rbp)
0000000000309107	movq	%r14, (%rcx)
000000000030910a	movq	%rcx, %rbx
000000000030910d	addq	$0x8, %rbx
0000000000309111	testq	%r12, %r12
0000000000309114	je	0x309138
0000000000309116	movq	-0x78(%rbp), %rdi
000000000030911a	movq	%rcx, %r14
000000000030911d	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000309122	movq	-0x58(%rbp), %rax
0000000000309126	movl	0xc0(%rax), %eax
000000000030912c	movl	%eax, -0xa0(%rbp)
0000000000309132	movq	%r14, -0x78(%rbp)
0000000000309136	jmp	0x30913c
0000000000309138	movq	%rcx, -0x78(%rbp)
000000000030913c	movq	%rbx, %r12
000000000030913f	jmp	0x308f63
0000000000309144	movabsq	$0x3ff0000000000000, %rdi       ## imm = 0x3FF0000000000000
000000000030914e	movq	-0x78(%rbp), %r8
0000000000309152	jmp	0x309164
0000000000309154	xorl	%r8d, %r8d
0000000000309157	xorl	%r12d, %r12d
000000000030915a	movabsq	$0x3ff0000000000000, %rdi       ## imm = 0x3FF0000000000000
0000000000309164	movq	-0xe0(%rbp), %r15
000000000030916b	leaq	-0x7c(%rbp), %r13
000000000030916f	movq	-0x90(%rbp), %rbx
0000000000309176	subq	%r8, %r12
0000000000309179	cmpq	$0x9, %r12
000000000030917d	jae	0x308e9c
0000000000309183	testq	%r8, %r8
0000000000309186	jne	0x307767
000000000030918c	jmp	0x30776f
0000000000309191	movaps	%xmm2, %xmm5
0000000000309194	shufps	$0xe1, %xmm2, %xmm5             ## xmm5 = xmm5[1,0],xmm2[2,3]
0000000000309198	movaps	%xmm7, %xmm6
000000000030919b	subps	%xmm4, %xmm6
000000000030919e	movaps	%xmm2, %xmm0
00000000003091a1	mulps	%xmm2, %xmm0
00000000003091a4	movaps	%xmm6, %xmm8
00000000003091a8	mulss	%xmm6, %xmm8
00000000003091ad	movshdup	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1,3,3]
00000000003091b1	addss	%xmm8, %xmm0
00000000003091b6	sqrtss	%xmm0, %xmm0
00000000003091ba	movsldup	%xmm0, %xmm8                    ## xmm8 = xmm0[0,0,2,2]
00000000003091bf	andps	0x3fe9fa(%rip), %xmm0
00000000003091c6	xorl	%eax, %eax
00000000003091c8	movss	0x3fea0f(%rip), %xmm9
00000000003091d1	ucomiss	%xmm0, %xmm9
00000000003091d5	setbe	%al
00000000003091d8	movaps	%xmm5, %xmm9
00000000003091dc	insertps	$0x1c, %xmm6, %xmm9             ## xmm9 = xmm9[0],xmm6[0],zero,zero
00000000003091e3	movaps	%xmm9, %xmm10
00000000003091e7	divps	%xmm8, %xmm10
00000000003091eb	movd	%eax, %xmm0
00000000003091ef	pshufd	$0x50, %xmm0, %xmm0             ## xmm0 = xmm0[0,0,1,1]
00000000003091f4	pslld	$0x1f, %xmm0
00000000003091f9	blendvps	%xmm0, %xmm10, %xmm9
00000000003091ff	movaps	%xmm3, %xmm8
0000000000309203	shufps	$0xe1, %xmm3, %xmm8             ## xmm8 = xmm8[1,0],xmm3[2,3]
0000000000309208	movaps	%xmm9, %xmm0
000000000030920c	mulps	%xmm3, %xmm0
000000000030920f	movshdup	%xmm0, %xmm10                   ## xmm10 = xmm0[1,1,3,3]
0000000000309214	addss	%xmm0, %xmm10
0000000000309219	xorl	%eax, %eax
000000000030921b	ucomiss	%xmm10, %xmm11
000000000030921f	seta	%al
0000000000309222	movaps	%xmm9, %xmm10
0000000000309226	xorps	0x3ff352(%rip), %xmm10
000000000030922e	movd	%eax, %xmm0
0000000000309232	pshufd	$0x50, %xmm0, %xmm0             ## xmm0 = xmm0[0,0,1,1]
0000000000309237	pslld	$0x1f, %xmm0
000000000030923c	blendvps	%xmm0, %xmm10, %xmm9
0000000000309242	movaps	%xmm4, %xmm0
0000000000309245	addps	%xmm9, %xmm0
0000000000309249	subps	%xmm4, %xmm0
000000000030924c	mulps	%xmm0, %xmm8
0000000000309250	movshdup	%xmm8, %xmm10                   ## xmm10 = xmm8[1,1,3,3]
0000000000309255	subps	%xmm10, %xmm8
0000000000309259	ucomiss	%xmm11, %xmm8
000000000030925d	movabsq	$0x3ff0000000000000, %rsi       ## imm = 0x3FF0000000000000
0000000000309267	leaq	-0x7c(%rbp), %r13
000000000030926b	jne	0x309273
000000000030926d	jnp	0x309a1e
0000000000309273	addps	%xmm7, %xmm9
0000000000309277	movaps	%xmm6, %xmm10
000000000030927b	blendps	$0x2, %xmm6, %xmm10             ## xmm10 = xmm10[0],xmm6[1],xmm10[2,3]
0000000000309282	shufps	$0xe1, %xmm10, %xmm10           ## xmm10 = xmm10[1,0,2,3]
0000000000309287	mulps	%xmm0, %xmm10
000000000030928b	movshdup	%xmm10, %xmm0                   ## xmm0 = xmm10[1,1,3,3]
0000000000309290	subss	%xmm10, %xmm0
0000000000309295	divss	%xmm8, %xmm0
000000000030929a	movsldup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,2,2]
000000000030929e	mulps	%xmm3, %xmm0
00000000003092a1	addps	%xmm7, %xmm0
00000000003092a4	movlps	%xmm0, -0x110(%rbp)
00000000003092ab	subps	%xmm7, %xmm9
00000000003092af	movaps	%xmm1, %xmm0
00000000003092b2	shufps	$0xe1, %xmm1, %xmm0             ## xmm0 = xmm0[1,0],xmm1[2,3]
00000000003092b6	movaps	%xmm0, %xmm7
00000000003092b9	mulps	%xmm9, %xmm7
00000000003092bd	movshdup	%xmm7, %xmm10                   ## xmm10 = xmm7[1,1,3,3]
00000000003092c2	subps	%xmm10, %xmm7
00000000003092c6	ucomiss	%xmm11, %xmm7
00000000003092ca	movq	-0x70(%rbp), %r14
00000000003092ce	jne	0x3092d6
00000000003092d0	jnp	0x309a65
00000000003092d6	mulps	%xmm5, %xmm9
00000000003092da	movshdup	%xmm9, %xmm10                   ## xmm10 = xmm9[1,1,3,3]
00000000003092df	subss	%xmm9, %xmm10
00000000003092e4	divss	%xmm7, %xmm10
00000000003092e9	movsldup	%xmm10, %xmm9                   ## xmm9 = xmm10[0,0,2,2]
00000000003092ee	mulps	%xmm1, %xmm9
00000000003092f2	addps	%xmm9, %xmm4
00000000003092f6	movlps	%xmm4, -0x108(%rbp)
00000000003092fd	blendps	$0xd, %xmm6, %xmm5              ## xmm5 = xmm6[0],xmm5[1],xmm6[2,3]
0000000000309303	insertps	$0x4c, %xmm3, %xmm1             ## xmm1 = xmm3[1],xmm1[1],zero,zero
0000000000309309	mulps	%xmm5, %xmm1
000000000030930c	insertps	$0x4c, %xmm6, %xmm2             ## xmm2 = xmm6[1],xmm2[1],zero,zero
0000000000309312	blendps	$0xd, %xmm3, %xmm0              ## xmm0 = xmm3[0],xmm0[1],xmm3[2,3]
0000000000309318	mulps	%xmm2, %xmm0
000000000030931b	subps	%xmm0, %xmm1
000000000030931e	insertps	$0x1c, %xmm7, %xmm8             ## xmm8 = xmm8[0],xmm7[0],zero,zero
0000000000309325	divps	%xmm8, %xmm1
0000000000309329	xorps	%xmm0, %xmm0
000000000030932c	cmpltps	%xmm1, %xmm0
0000000000309330	unpcklps	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0,1,1]
0000000000309333	movmskpd	%xmm0, %eax
0000000000309337	cmpl	$0x3, %eax
000000000030933a	jne	0x309479
0000000000309340	movq	-0x50(%rbp), %rcx
0000000000309344	movq	%rcx, (%r14)
0000000000309347	movq	-0xc8(%rbp), %rax
000000000030934e	movq	%rax, 0x8(%r14)
0000000000309352	movq	-0xd0(%rbp), %rdx
0000000000309359	movq	%rdx, 0x10(%r14)
000000000030935d	movl	$0x4, 0x1c(%r14)
0000000000309365	movd	%ecx, %xmm2
0000000000309369	shrq	$0x20, %rcx
000000000030936d	movd	%ecx, %xmm3
0000000000309371	movq	%rax, %rcx
0000000000309374	shrq	$0x20, %rcx
0000000000309378	movd	%ecx, %xmm5
000000000030937c	movdqa	%xmm5, %xmm8
0000000000309381	pinsrd	$0x1, %edx, %xmm8
0000000000309388	shrq	$0x20, %rdx
000000000030938c	movd	%edx, %xmm0
0000000000309390	movd	%edx, %xmm6
0000000000309394	movdqa	%xmm5, %xmm1
0000000000309398	subss	%xmm0, %xmm1
000000000030939c	pinsrd	$0x1, %eax, %xmm0
00000000003093a2	movd	%ecx, %xmm4
00000000003093a6	mulss	%xmm2, %xmm1
00000000003093aa	subps	%xmm8, %xmm0
00000000003093ae	movshdup	%xmm0, %xmm9                    ## xmm9 = xmm0[1,1,3,3]
00000000003093b3	mulss	%xmm3, %xmm9
00000000003093b8	movd	%eax, %xmm7
00000000003093bc	mulss	%xmm7, %xmm6
00000000003093c0	pshufd	$0xf5, %xmm8, %xmm8             ## xmm8 = xmm8[1,1,3,3]
00000000003093c6	mulss	%xmm5, %xmm8
00000000003093cb	insertps	$0x10, %xmm3, %xmm1             ## xmm1 = xmm1[0],xmm3[0],xmm1[2,3]
00000000003093d1	mulss	%xmm7, %xmm3
00000000003093d5	subss	%xmm2, %xmm7
00000000003093d9	mulss	%xmm2, %xmm4
00000000003093dd	subss	%xmm3, %xmm4
00000000003093e1	movq	$0x0, 0x30(%r14)
00000000003093e9	insertps	$0x1c, %xmm5, %xmm9             ## xmm9 = xmm9[0],xmm5[0],zero,zero
00000000003093f0	subps	%xmm9, %xmm1
00000000003093f4	addss	%xmm1, %xmm6
00000000003093f8	subss	%xmm8, %xmm6
00000000003093fd	movss	0x3fdb4b(%rip), %xmm2
0000000000309405	divss	%xmm6, %xmm2
0000000000309409	movsldup	%xmm2, %xmm3                    ## xmm3 = xmm2[0,0,2,2]
000000000030940d	mulps	%xmm3, %xmm0
0000000000309410	mulps	%xmm3, %xmm1
0000000000309413	mulss	%xmm2, %xmm7
0000000000309417	mulss	%xmm4, %xmm2
000000000030941b	cvtps2pd	%xmm0, %xmm0
000000000030941e	movups	%xmm0, 0x20(%r14)
0000000000309423	cvtps2pd	%xmm1, %xmm0
0000000000309426	movups	%xmm0, 0x38(%r14)
000000000030942b	xorps	%xmm0, %xmm0
000000000030942e	cvtss2sd	%xmm7, %xmm0
0000000000309432	movsd	%xmm0, 0x48(%r14)
0000000000309438	movq	$0x0, 0x50(%r14)
0000000000309440	xorps	%xmm0, %xmm0
0000000000309443	cvtss2sd	%xmm2, %xmm0
0000000000309447	movsd	%xmm0, 0x58(%r14)
000000000030944d	xorps	%xmm0, %xmm0
0000000000309450	movups	%xmm0, 0x60(%r14)
0000000000309455	movups	%xmm0, 0x70(%r14)
000000000030945a	movups	%xmm0, 0x80(%r14)
0000000000309462	movq	$0x0, 0x90(%r14)
000000000030946d	movq	%rsi, 0x98(%r14)
0000000000309474	jmp	0x3098d2
0000000000309479	testb	$0x1, %al
000000000030947b	je	0x3096a6
0000000000309481	movq	-0x50(%rbp), %rax
0000000000309485	movq	%rax, (%r14)
0000000000309488	movq	-0x110(%rbp), %rbx
000000000030948f	movq	%rbx, 0x8(%r14)
0000000000309493	movq	-0xd0(%rbp), %r12
000000000030949a	movq	%r12, 0x10(%r14)
000000000030949e	movl	$0x4, 0x1c(%r14)
00000000003094a6	movd	%eax, %xmm2
00000000003094aa	shrq	$0x20, %rax
00000000003094ae	movd	%eax, %xmm4
00000000003094b2	movq	%rbx, %rax
00000000003094b5	shrq	$0x20, %rax
00000000003094b9	movq	%r12, %rcx
00000000003094bc	shrq	$0x20, %rcx
00000000003094c0	movd	%eax, %xmm7
00000000003094c4	movdqa	%xmm7, %xmm8
00000000003094c9	pinsrd	$0x1, %r12d, %xmm8
00000000003094d0	movd	%ecx, %xmm0
00000000003094d4	movd	%ecx, %xmm5
00000000003094d8	movdqa	%xmm7, %xmm1
00000000003094dc	subss	%xmm0, %xmm1
00000000003094e0	pinsrd	$0x1, %ebx, %xmm0
00000000003094e6	movd	%eax, %xmm3
00000000003094ea	mulss	%xmm2, %xmm1
00000000003094ee	subps	%xmm8, %xmm0
00000000003094f2	movshdup	%xmm0, %xmm9                    ## xmm9 = xmm0[1,1,3,3]
00000000003094f7	mulss	%xmm4, %xmm9
00000000003094fc	movd	%ebx, %xmm6
0000000000309500	mulss	%xmm6, %xmm5
0000000000309504	pshufd	$0xf5, %xmm8, %xmm8             ## xmm8 = xmm8[1,1,3,3]
000000000030950a	mulss	%xmm7, %xmm8
000000000030950f	insertps	$0x10, %xmm4, %xmm1             ## xmm1 = xmm1[0],xmm4[0],xmm1[2,3]
0000000000309515	mulss	%xmm6, %xmm4
0000000000309519	subss	%xmm2, %xmm6
000000000030951d	mulss	%xmm2, %xmm3
0000000000309521	subss	%xmm4, %xmm3
0000000000309525	movq	$0x0, 0x30(%r14)
000000000030952d	insertps	$0x1c, %xmm7, %xmm9             ## xmm9 = xmm9[0],xmm7[0],zero,zero
0000000000309534	subps	%xmm9, %xmm1
0000000000309538	addss	%xmm1, %xmm5
000000000030953c	subss	%xmm8, %xmm5
0000000000309541	movss	0x3fda07(%rip), %xmm2
0000000000309549	divss	%xmm5, %xmm2
000000000030954d	movsldup	%xmm2, %xmm4                    ## xmm4 = xmm2[0,0,2,2]
0000000000309551	mulps	%xmm4, %xmm0
0000000000309554	mulps	%xmm4, %xmm1
0000000000309557	mulss	%xmm2, %xmm6
000000000030955b	mulss	%xmm3, %xmm2
000000000030955f	cvtps2pd	%xmm0, %xmm0
0000000000309562	movups	%xmm0, 0x20(%r14)
0000000000309567	cvtps2pd	%xmm1, %xmm0
000000000030956a	movups	%xmm0, 0x38(%r14)
000000000030956f	xorps	%xmm0, %xmm0
0000000000309572	cvtss2sd	%xmm6, %xmm0
0000000000309576	movsd	%xmm0, 0x48(%r14)
000000000030957c	movq	$0x0, 0x50(%r14)
0000000000309584	xorps	%xmm0, %xmm0
0000000000309587	cvtss2sd	%xmm2, %xmm0
000000000030958b	movsd	%xmm0, 0x58(%r14)
0000000000309591	xorps	%xmm0, %xmm0
0000000000309594	movups	%xmm0, 0x60(%r14)
0000000000309599	movups	%xmm0, 0x70(%r14)
000000000030959e	movups	%xmm0, 0x80(%r14)
00000000003095a6	movq	$0x0, 0x90(%r14)
00000000003095b1	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000003095bb	movq	%rax, 0x98(%r14)
00000000003095c2	movl	$0xa8, %edi
00000000003095c7	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003095cc	movq	%rax, %r15
00000000003095cf	movl	0x18(%r14), %eax
00000000003095d3	movabsq	$0x3ff0000000000000, %rcx       ## imm = 0x3FF0000000000000
00000000003095dd	movq	%rcx, 0x98(%r15)
00000000003095e4	movq	%rcx, 0x70(%r15)
00000000003095e8	movq	%rcx, 0x48(%r15)
00000000003095ec	movq	%rcx, 0x20(%r15)
00000000003095f0	xorps	%xmm0, %xmm0
00000000003095f3	movups	%xmm0, 0x28(%r15)
00000000003095f8	movups	%xmm0, 0x38(%r15)
00000000003095fd	movups	%xmm0, 0x50(%r15)
0000000000309602	movups	%xmm0, 0x60(%r15)
0000000000309607	movups	%xmm0, 0x78(%r15)
000000000030960c	movups	%xmm0, 0x88(%r15)
0000000000309614	movl	__ZN10PTTriangle9idCounterE(%rip), %ecx ## PTTriangle::idCounter
000000000030961a	incl	%ecx
000000000030961c	movl	%ecx, __ZN10PTTriangle9idCounterE(%rip) ## PTTriangle::idCounter
0000000000309622	movl	%ecx, 0xa0(%r15)
0000000000309629	movl	$0x0, 0xa4(%r15)
0000000000309634	movq	%r12, (%r15)
0000000000309637	movq	-0xc8(%rbp), %rcx
000000000030963e	movq	%rcx, 0x8(%r15)
0000000000309642	movq	%rbx, 0x10(%r15)
0000000000309646	movl	%eax, 0x18(%r15)
000000000030964a	movl	0x18(%r14), %eax
000000000030964e	movl	%eax, 0x1c(%r15)
0000000000309652	movl	$0x18, %edi
0000000000309657	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000030965c	movq	%r15, 0x10(%rax)
0000000000309660	movq	-0x90(%rbp), %rdx
0000000000309667	movq	(%rdx), %rcx
000000000030966a	movq	%rax, 0x8(%rcx)
000000000030966e	movq	%rcx, (%rax)
0000000000309671	movq	%rax, (%rdx)
0000000000309674	movq	%rdx, 0x8(%rax)
0000000000309678	movq	-0x58(%rbp), %rdi
000000000030967c	incq	0x18(%rdi)
0000000000309680	movq	%r14, %rsi
0000000000309683	leaq	-0xc8(%rbp), %rdx
000000000030968a	leaq	-0x50(%rbp), %rcx
000000000030968e	leaq	-0x110(%rbp), %r8
0000000000309695	leaq	-0xf0(%rbp), %r9
000000000030969c	callq	__ZN13OZVectorShape25subdivideAdjacentTriangleEPK10PTTriangleRK9PCVector2IfES6_S6_RNSt3__115__list_iteratorIPS0_PvEE ## OZVectorShape::subdivideAdjacentTriangle(PTTriangle const*, PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, std::__1::__list_iterator<PTTriangle*, void*>&)
00000000003096a1	jmp	0x3098d2
00000000003096a6	shrb	%al
00000000003096a8	je	0x3098d2
00000000003096ae	movq	-0x50(%rbp), %r12
00000000003096b2	movq	%r12, (%r14)
00000000003096b5	movq	-0x108(%rbp), %rbx
00000000003096bc	movq	%rbx, 0x8(%r14)
00000000003096c0	movq	-0xd0(%rbp), %rax
00000000003096c7	movq	%rax, 0x10(%r14)
00000000003096cb	movl	$0x4, 0x1c(%r14)
00000000003096d3	movd	%r12d, %xmm2
00000000003096d8	movq	%r12, %rcx
00000000003096db	shrq	$0x20, %rcx
00000000003096df	movd	%ecx, %xmm3
00000000003096e3	movq	%rbx, %rcx
00000000003096e6	shrq	$0x20, %rcx
00000000003096ea	movd	%ecx, %xmm5
00000000003096ee	movdqa	%xmm5, %xmm8
00000000003096f3	pinsrd	$0x1, %eax, %xmm8
00000000003096fa	shrq	$0x20, %rax
00000000003096fe	movd	%eax, %xmm0
0000000000309702	movd	%eax, %xmm6
0000000000309706	movdqa	%xmm5, %xmm1
000000000030970a	subss	%xmm0, %xmm1
000000000030970e	pinsrd	$0x1, %ebx, %xmm0
0000000000309714	movd	%ecx, %xmm4
0000000000309718	mulss	%xmm2, %xmm1
000000000030971c	subps	%xmm8, %xmm0
0000000000309720	movshdup	%xmm0, %xmm9                    ## xmm9 = xmm0[1,1,3,3]
0000000000309725	mulss	%xmm3, %xmm9
000000000030972a	movd	%ebx, %xmm7
000000000030972e	mulss	%xmm7, %xmm6
0000000000309732	pshufd	$0xf5, %xmm8, %xmm8             ## xmm8 = xmm8[1,1,3,3]
0000000000309738	mulss	%xmm5, %xmm8
000000000030973d	insertps	$0x10, %xmm3, %xmm1             ## xmm1 = xmm1[0],xmm3[0],xmm1[2,3]
0000000000309743	mulss	%xmm7, %xmm3
0000000000309747	subss	%xmm2, %xmm7
000000000030974b	mulss	%xmm2, %xmm4
000000000030974f	subss	%xmm3, %xmm4
0000000000309753	movq	$0x0, 0x30(%r14)
000000000030975b	insertps	$0x1c, %xmm5, %xmm9             ## xmm9 = xmm9[0],xmm5[0],zero,zero
0000000000309762	subps	%xmm9, %xmm1
0000000000309766	addss	%xmm1, %xmm6
000000000030976a	subss	%xmm8, %xmm6
000000000030976f	movss	0x3fd7d9(%rip), %xmm2
0000000000309777	divss	%xmm6, %xmm2
000000000030977b	movsldup	%xmm2, %xmm3                    ## xmm3 = xmm2[0,0,2,2]
000000000030977f	mulps	%xmm3, %xmm0
0000000000309782	mulps	%xmm3, %xmm1
0000000000309785	mulss	%xmm2, %xmm7
0000000000309789	mulss	%xmm4, %xmm2
000000000030978d	cvtps2pd	%xmm0, %xmm0
0000000000309790	movups	%xmm0, 0x20(%r14)
0000000000309795	cvtps2pd	%xmm1, %xmm0
0000000000309798	movups	%xmm0, 0x38(%r14)
000000000030979d	xorps	%xmm0, %xmm0
00000000003097a0	cvtss2sd	%xmm7, %xmm0
00000000003097a4	movsd	%xmm0, 0x48(%r14)
00000000003097aa	movq	$0x0, 0x50(%r14)
00000000003097b2	xorps	%xmm0, %xmm0
00000000003097b5	cvtss2sd	%xmm2, %xmm0
00000000003097b9	movsd	%xmm0, 0x58(%r14)
00000000003097bf	xorps	%xmm0, %xmm0
00000000003097c2	movups	%xmm0, 0x60(%r14)
00000000003097c7	movups	%xmm0, 0x70(%r14)
00000000003097cc	movups	%xmm0, 0x80(%r14)
00000000003097d4	movq	$0x0, 0x90(%r14)
00000000003097df	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000003097e9	movq	%rax, 0x98(%r14)
00000000003097f0	movl	$0xa8, %edi
00000000003097f5	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000003097fa	movq	%rax, %r15
00000000003097fd	movl	0x18(%r14), %eax
0000000000309801	movabsq	$0x3ff0000000000000, %rcx       ## imm = 0x3FF0000000000000
000000000030980b	movq	%rcx, 0x98(%r15)
0000000000309812	movq	%rcx, 0x70(%r15)
0000000000309816	movq	%rcx, 0x48(%r15)
000000000030981a	movq	%rcx, 0x20(%r15)
000000000030981e	xorps	%xmm0, %xmm0
0000000000309821	movups	%xmm0, 0x28(%r15)
0000000000309826	movups	%xmm0, 0x38(%r15)
000000000030982b	movups	%xmm0, 0x50(%r15)
0000000000309830	movups	%xmm0, 0x60(%r15)
0000000000309835	movups	%xmm0, 0x78(%r15)
000000000030983a	movups	%xmm0, 0x88(%r15)
0000000000309842	movl	__ZN10PTTriangle9idCounterE(%rip), %ecx ## PTTriangle::idCounter
0000000000309848	incl	%ecx
000000000030984a	movl	%ecx, __ZN10PTTriangle9idCounterE(%rip) ## PTTriangle::idCounter
0000000000309850	movl	%ecx, 0xa0(%r15)
0000000000309857	movl	$0x0, 0xa4(%r15)
0000000000309862	movq	%r12, (%r15)
0000000000309865	movq	-0xc8(%rbp), %rcx
000000000030986c	movq	%rcx, 0x8(%r15)
0000000000309870	movq	%rbx, 0x10(%r15)
0000000000309874	movl	%eax, 0x18(%r15)
0000000000309878	movl	0x18(%r14), %eax
000000000030987c	movl	%eax, 0x1c(%r15)
0000000000309880	movl	$0x18, %edi
0000000000309885	callq	0x6dfca2                        ## symbol stub for: __Znwm
000000000030988a	movq	%r15, 0x10(%rax)
000000000030988e	movq	-0x90(%rbp), %rdx
0000000000309895	movq	(%rdx), %rcx
0000000000309898	movq	%rax, 0x8(%rcx)
000000000030989c	movq	%rcx, (%rax)
000000000030989f	movq	%rax, (%rdx)
00000000003098a2	movq	%rdx, 0x8(%rax)
00000000003098a6	movq	-0x58(%rbp), %rdi
00000000003098aa	incq	0x18(%rdi)
00000000003098ae	movq	%r14, %rsi
00000000003098b1	leaq	-0xc8(%rbp), %rdx
00000000003098b8	leaq	-0xd0(%rbp), %rcx
00000000003098bf	leaq	-0x108(%rbp), %r8
00000000003098c6	leaq	-0xf0(%rbp), %r9
00000000003098cd	callq	__ZN13OZVectorShape25subdivideAdjacentTriangleEPK10PTTriangleRK9PCVector2IfES6_S6_RNSt3__115__list_iteratorIPS0_PvEE ## OZVectorShape::subdivideAdjacentTriangle(PTTriangle const*, PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, std::__1::__list_iterator<PTTriangle*, void*>&)
00000000003098d2	movq	-0x58(%rbp), %r14
00000000003098d6	movq	-0x90(%rbp), %rbx
00000000003098dd	movq	-0xe0(%rbp), %r15
00000000003098e4	jmp	0x307773
00000000003098e9	movq	%r12, %rbx
00000000003098ec	cmpq	-0x100(%rbp), %r12
00000000003098f3	jae	0x309919
00000000003098f5	movq	%r14, (%rbx)
00000000003098f8	addq	$0x8, %rbx
00000000003098fc	movabsq	$0x3ff0000000000000, %rdi       ## imm = 0x3FF0000000000000
0000000000309906	movq	-0xe0(%rbp), %r15
000000000030990d	leaq	-0x7c(%rbp), %r13
0000000000309911	movq	%rbx, %r12
0000000000309914	jmp	0x30916f
0000000000309919	subq	%r8, %rbx
000000000030991c	movq	%rbx, %r12
000000000030991f	sarq	$0x3, %rbx
0000000000309923	leaq	0x1(%rbx), %rax
0000000000309927	movabsq	$0x1fffffffffffffff, %rcx       ## imm = 0x1FFFFFFFFFFFFFFF
0000000000309931	cmpq	%rcx, %rax
0000000000309934	movq	-0xe0(%rbp), %r15
000000000030993b	leaq	-0x7c(%rbp), %r13
000000000030993f	ja	0x309aba
0000000000309945	movq	-0x100(%rbp), %rsi
000000000030994c	subq	%r8, %rsi
000000000030994f	movq	%rsi, %rdi
0000000000309952	sarq	$0x2, %rdi
0000000000309956	cmpq	%rax, %rdi
0000000000309959	cmovbeq	%rax, %rdi
000000000030995d	movabsq	$0x7ffffffffffffff8, %rax       ## imm = 0x7FFFFFFFFFFFFFF8
0000000000309967	cmpq	%rax, %rsi
000000000030996a	cmovaeq	%rcx, %rdi
000000000030996e	cmpq	%rcx, %rdi
0000000000309971	ja	0x309ac1
0000000000309977	shlq	$0x3, %rdi
000000000030997b	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000309980	movq	%r12, %rdx
0000000000309983	movq	%r14, (%rax,%r12)
0000000000309987	addq	%rax, %r12
000000000030998a	addq	$0x8, %r12
000000000030998e	addq	%rdx, %rax
0000000000309991	shlq	$0x3, %rbx
0000000000309995	subq	%rbx, %rax
0000000000309998	movq	%rax, %rdi
000000000030999b	movq	-0x78(%rbp), %r14
000000000030999f	movq	%r14, %rsi
00000000003099a2	movq	%rax, %rbx
00000000003099a5	callq	0x6dff8a                        ## symbol stub for: _memcpy
00000000003099aa	movq	%r14, %rdi
00000000003099ad	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003099b2	movq	%rbx, %r8
00000000003099b5	movabsq	$0x3ff0000000000000, %rdi       ## imm = 0x3FF0000000000000
00000000003099bf	jmp	0x30916f
00000000003099c4	leaq	-0x230(%rbp), %rdi
00000000003099cb	callq	0x6dd440                        ## symbol stub for: __ZN10PCDelaunayD1Ev
00000000003099d0	movb	$0x1, 0x78(%r14)
00000000003099d5	movq	-0x140(%rbp), %rdi
00000000003099dc	testq	%rdi, %rdi
00000000003099df	je	0x3099ed
00000000003099e1	movq	%rdi, -0x138(%rbp)
00000000003099e8	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000003099ed	movq	0x51ca44(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000003099f4	movq	(%rax), %rax
00000000003099f7	cmpq	-0x30(%rbp), %rax
00000000003099fb	jne	0x309a0f
00000000003099fd	addq	$0x218, %rsp                    ## imm = 0x218
0000000000309a04	popq	%rbx
0000000000309a05	popq	%r12
0000000000309a07	popq	%r13
0000000000309a09	popq	%r14
0000000000309a0b	popq	%r15
0000000000309a0d	popq	%rbp
0000000000309a0e	retq
0000000000309a0f	callq	0x6dfd38                        ## symbol stub for: ___stack_chk_fail
0000000000309a14	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
0000000000309a19	jmp	0x309ac6
0000000000309a1e	movl	$0x40, %edi
0000000000309a23	callq	0x6dfcc0                        ## symbol stub for: ___cxa_allocate_exception
0000000000309a28	movq	%rax, %r14
0000000000309a2b	leaq	0x4cad5a(%rip), %rsi            ## literal pool for: "no intersection"
0000000000309a32	leaq	-0xe8(%rbp), %rdi
0000000000309a39	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
0000000000309a3e	leaq	-0xe8(%rbp), %rsi
0000000000309a45	movq	%r14, %rdi
0000000000309a48	callq	__ZN20PCAssertionExceptionC1ERK8PCString ## PCAssertionException::PCAssertionException(PCString const&)
0000000000309a4d	movq	0x51d4d4(%rip), %rsi            ## literal pool symbol address: __ZTI20PCAssertionException
0000000000309a54	leaq	__ZN20PCAssertionExceptionD1Ev(%rip), %rdx ## PCAssertionException::~PCAssertionException()
0000000000309a5b	movq	%r14, %rdi
0000000000309a5e	callq	0x6dfd08                        ## symbol stub for: ___cxa_throw
0000000000309a63	jmp	0x309ac6
0000000000309a65	movl	$0x40, %edi
0000000000309a6a	callq	0x6dfcc0                        ## symbol stub for: ___cxa_allocate_exception
0000000000309a6f	movq	%rax, %r14
0000000000309a72	leaq	0x4cad13(%rip), %rsi            ## literal pool for: "no intersection"
0000000000309a79	leaq	-0xe8(%rbp), %rdi
0000000000309a80	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
0000000000309a85	leaq	-0xe8(%rbp), %rsi
0000000000309a8c	movq	%r14, %rdi
0000000000309a8f	callq	__ZN20PCAssertionExceptionC1ERK8PCString ## PCAssertionException::PCAssertionException(PCString const&)
0000000000309a94	movq	0x51d48d(%rip), %rsi            ## literal pool symbol address: __ZTI20PCAssertionException
0000000000309a9b	leaq	__ZN20PCAssertionExceptionD1Ev(%rip), %rdx ## PCAssertionException::~PCAssertionException()
0000000000309aa2	movq	%r14, %rdi
0000000000309aa5	callq	0x6dfd08                        ## symbol stub for: ___cxa_throw
0000000000309aaa	jmp	0x309ac6
0000000000309aac	callq	__ZNSt3__16vectorIP15OZQuadraticPathNS_9allocatorIS2_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<OZQuadraticPath*, std::__1::allocator<OZQuadraticPath*>>::__throw_length_error[abi:nqe210106]()
0000000000309ab1	jmp	0x309ac6
0000000000309ab3	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
0000000000309ab8	jmp	0x309ac6
0000000000309aba	callq	__ZNSt3__16vectorIP10PTTriangleNS_9allocatorIS2_EEE20__throw_length_errorB9nqe210106Ev ## std::__1::vector<PTTriangle*, std::__1::allocator<PTTriangle*>>::__throw_length_error[abi:nqe210106]()
0000000000309abf	jmp	0x309ac6
0000000000309ac1	callq	__ZSt28__throw_bad_array_new_lengthB9nqe210106v ## std::__throw_bad_array_new_length[abi:nqe210106]()
0000000000309ac6	ud2
0000000000309ac8	jmp	0x309aca
0000000000309aca	movq	%rax, %rbx
0000000000309acd	jmp	0x309b57
0000000000309ad2	jmp	0x309ad6
0000000000309ad4	jmp	0x309aea
0000000000309ad6	movq	%rax, %rbx
0000000000309ad9	leaq	-0xe8(%rbp), %rdi
0000000000309ae0	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000309ae5	jmp	0x309b95
0000000000309aea	movq	%rax, %rbx
0000000000309aed	leaq	-0xe8(%rbp), %rdi
0000000000309af4	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000309af9	jmp	0x309b05
0000000000309afb	jmp	0x309b92
0000000000309b00	jmp	0x309b02
0000000000309b02	movq	%rax, %rbx
0000000000309b05	movq	%r14, %rdi
0000000000309b08	callq	0x6dfce4                        ## symbol stub for: ___cxa_free_exception
0000000000309b0d	jmp	0x309b95
0000000000309b12	jmp	0x309b92
0000000000309b14	jmp	0x309bb3
0000000000309b19	jmp	0x309bb3
0000000000309b1e	jmp	0x309bb3
0000000000309b23	jmp	0x309bb3
0000000000309b28	jmp	0x309bb3
0000000000309b2d	jmp	0x309bb3
0000000000309b32	jmp	0x309bb3
0000000000309b34	jmp	0x309bb3
0000000000309b36	jmp	0x309b92
0000000000309b38	jmp	0x309bb3
0000000000309b3a	movq	%rax, %rbx
0000000000309b3d	movq	%r14, %rdi
0000000000309b40	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000309b45	jmp	0x309bb6
0000000000309b47	jmp	0x309b92
0000000000309b49	jmp	0x309b92
0000000000309b4b	jmp	0x309bb3
0000000000309b4d	jmp	0x309b4f
0000000000309b4f	movq	%rax, %rbx
0000000000309b52	testq	%r12, %r12
0000000000309b55	je	0x309b95
0000000000309b57	movq	-0x78(%rbp), %rdi
0000000000309b5b	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000309b60	jmp	0x309b95
0000000000309b62	jmp	0x309b92
0000000000309b64	jmp	0x309b92
0000000000309b66	jmp	0x309bb3
0000000000309b68	jmp	0x309b92
0000000000309b6a	jmp	0x309b92
0000000000309b6c	jmp	0x309b92
0000000000309b6e	jmp	0x309bb3
0000000000309b70	jmp	0x309bb3
0000000000309b72	jmp	0x309bb3
0000000000309b74	jmp	0x309bb3
0000000000309b76	jmp	0x309bb3
0000000000309b78	jmp	0x309bb3
0000000000309b7a	jmp	0x309bb3
0000000000309b7c	jmp	0x309bb3
0000000000309b7e	jmp	0x309bb3
0000000000309b80	jmp	0x309bb3
0000000000309b82	jmp	0x309b92
0000000000309b84	jmp	0x309b92
0000000000309b86	jmp	0x309bb3
0000000000309b88	jmp	0x309bb3
0000000000309b8a	jmp	0x309bb3
0000000000309b8c	jmp	0x309b92
0000000000309b8e	jmp	0x309b92
0000000000309b90	jmp	0x309b92
0000000000309b92	movq	%rax, %rbx
0000000000309b95	leaq	-0x230(%rbp), %rdi
0000000000309b9c	callq	0x6dd440                        ## symbol stub for: __ZN10PCDelaunayD1Ev
0000000000309ba1	jmp	0x309bb6
0000000000309ba3	jmp	0x309bb3
0000000000309ba5	jmp	0x309bb3
0000000000309ba7	jmp	0x309bb3
0000000000309ba9	jmp	0x309bb3
0000000000309bab	jmp	0x309bb3
0000000000309bad	jmp	0x309bb3
0000000000309baf	jmp	0x309bb3
0000000000309bb1	jmp	0x309bb3
0000000000309bb3	movq	%rax, %rbx
0000000000309bb6	movq	-0x140(%rbp), %rdi
0000000000309bbd	testq	%rdi, %rdi
0000000000309bc0	je	0x309bce
0000000000309bc2	movq	%rdi, -0x138(%rbp)
0000000000309bc9	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000309bce	movq	%rbx, %rdi
0000000000309bd1	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000309bd6	nopw	%cs:(%rax,%rax)
