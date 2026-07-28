__ZN14HgcBlendBlur_3C1Ev:
0000000000236540	pushq	%rbp
0000000000236541	movq	%rsp, %rbp
0000000000236544	pushq	%r14
0000000000236546	pushq	%rbx
0000000000236547	movq	%rdi, %rbx
000000000023654a	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000023654f	leaq	0x7fe842(%rip), %rax
0000000000236556	movq	%rax, (%rbx)
0000000000236559	movl	$0x107, %edi                    ## imm = 0x107
000000000023655e	callq	0x3c4fac                        ## symbol stub for: __Znam
0000000000236563	leaq	0x8(%rax), %rcx
0000000000236567	negl	%ecx
0000000000236569	andl	$0x1f, %ecx
000000000023656c	leaq	(%rcx,%rax), %rdx
0000000000236570	addq	$0x8, %rdx
0000000000236574	movq	%rax, (%rcx,%rax)
0000000000236578	xorps	%xmm0, %xmm0
000000000023657b	movaps	%xmm0, 0x8(%rcx,%rax)
0000000000236580	movaps	%xmm0, 0x18(%rcx,%rax)
0000000000236585	movaps	%xmm0, 0x28(%rcx,%rax)
000000000023658a	movaps	%xmm0, 0x38(%rcx,%rax)
000000000023658f	movaps	%xmm0, 0x48(%rcx,%rax)
0000000000236594	movaps	%xmm0, 0x58(%rcx,%rax)
0000000000236599	movaps	%xmm0, 0x68(%rcx,%rax)
000000000023659e	movaps	%xmm0, 0x78(%rcx,%rax)
00000000002365a3	movaps	%xmm0, 0x88(%rcx,%rax)
00000000002365ab	movaps	%xmm0, 0x98(%rcx,%rax)
00000000002365b3	movaps	%xmm0, 0xa8(%rcx,%rax)
00000000002365bb	movaps	%xmm0, 0xb8(%rcx,%rax)
00000000002365c3	movss	0x1916f5(%rip), %xmm0
00000000002365cb	movaps	%xmm0, 0xd8(%rcx,%rax)
00000000002365d3	movaps	%xmm0, 0xc8(%rcx,%rax)
00000000002365db	movq	%rdx, 0x198(%rbx)
00000000002365e2	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
00000000002365e7	andl	0x10(%rbx), %eax
00000000002365ea	orl	$0x400, %eax                    ## imm = 0x400
00000000002365ef	movl	%eax, 0x10(%rbx)
00000000002365f2	popq	%rbx
00000000002365f3	popq	%r14
00000000002365f5	popq	%rbp
00000000002365f6	retq
00000000002365f7	movq	%rax, %r14
00000000002365fa	movq	%rbx, %rdi
00000000002365fd	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000236602	movq	%r14, %rdi
0000000000236605	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000023660a	nopw	(%rax,%rax)
