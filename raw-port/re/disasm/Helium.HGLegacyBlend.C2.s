__ZN13HGLegacyBlendC2Ev:
00000000002415d0	pushq	%rbp
00000000002415d1	movq	%rsp, %rbp
00000000002415d4	pushq	%r14
00000000002415d6	pushq	%rbx
00000000002415d7	movq	%rdi, %rbx
00000000002415da	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000002415df	leaq	0x7f4cfa(%rip), %rax
00000000002415e6	movq	%rax, (%rbx)
00000000002415e9	movq	$0x0, 0x198(%rbx)
00000000002415f4	movl	$0x107, %edi                    ## imm = 0x107
00000000002415f9	callq	0x3c4fac                        ## symbol stub for: __Znam
00000000002415fe	leaq	0x8(%rax), %rcx
0000000000241602	negl	%ecx
0000000000241604	andl	$0x1f, %ecx
0000000000241607	leaq	(%rcx,%rax), %rdx
000000000024160b	addq	$0x8, %rdx
000000000024160f	movq	%rax, (%rcx,%rax)
0000000000241613	xorps	%xmm0, %xmm0
0000000000241616	movaps	%xmm0, 0x8(%rcx,%rax)
000000000024161b	movaps	%xmm0, 0x18(%rcx,%rax)
0000000000241620	movaps	%xmm0, 0x28(%rcx,%rax)
0000000000241625	movaps	%xmm0, 0x38(%rcx,%rax)
000000000024162a	movaps	%xmm0, 0x48(%rcx,%rax)
000000000024162f	movaps	%xmm0, 0x58(%rcx,%rax)
0000000000241634	movaps	0x186605(%rip), %xmm0
000000000024163b	movaps	%xmm0, 0x78(%rcx,%rax)
0000000000241640	movaps	%xmm0, 0x68(%rcx,%rax)
0000000000241645	movaps	0x61e5f4(%rip), %xmm1
000000000024164c	movaps	%xmm1, 0x98(%rcx,%rax)
0000000000241654	movaps	%xmm1, 0x88(%rcx,%rax)
000000000024165c	movaps	0x1865cd(%rip), %xmm1
0000000000241663	movaps	%xmm1, 0xb8(%rcx,%rax)
000000000024166b	movaps	%xmm1, 0xa8(%rcx,%rax)
0000000000241673	movaps	0x64b176(%rip), %xmm1
000000000024167a	movaps	%xmm1, 0xd8(%rcx,%rax)
0000000000241682	movaps	%xmm1, 0xc8(%rcx,%rax)
000000000024168a	movq	%rdx, 0x1b8(%rbx)
0000000000241691	movl	$0x0, 0x1a8(%rbx)
000000000024169b	movl	$0x3f800000, 0x1a0(%rbx)        ## imm = 0x3F800000
00000000002416a5	movaps	%xmm0, 0x18(%rcx,%rax)
00000000002416aa	movq	0x1b8(%rbx), %rax
00000000002416b1	movaps	%xmm0, (%rax)
00000000002416b4	movq	%rbx, %rdi
00000000002416b7	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000002416bc	movabsq	$0x100000000, %rax              ## imm = 0x100000000
00000000002416c6	movq	%rax, 0x1ac(%rbx)
00000000002416cd	movl	$0x3ffa5e35, 0x1a4(%rbx)        ## imm = 0x3FFA5E35
00000000002416d7	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
00000000002416dc	andl	0x10(%rbx), %eax
00000000002416df	orl	$0x400, %eax                    ## imm = 0x400
00000000002416e4	movl	%eax, 0x10(%rbx)
00000000002416e7	popq	%rbx
00000000002416e8	popq	%r14
00000000002416ea	popq	%rbp
00000000002416eb	retq
00000000002416ec	movq	%rax, %r14
00000000002416ef	movq	0x198(%rbx), %rdi
00000000002416f6	testq	%rdi, %rdi
00000000002416f9	je	0x241701
00000000002416fb	movq	(%rdi), %rax
00000000002416fe	callq	*0x18(%rax)
0000000000241701	movq	%rbx, %rdi
0000000000241704	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000241709	movq	%r14, %rdi
000000000024170c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000241711	movq	%rax, %rdi
0000000000241714	callq	___clang_call_terminate
0000000000241719	nopl	(%rax)
