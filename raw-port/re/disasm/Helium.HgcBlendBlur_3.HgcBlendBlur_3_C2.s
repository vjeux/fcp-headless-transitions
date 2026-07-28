__ZN14HgcBlendBlur_3C2Ev:
0000000000236470	pushq	%rbp
0000000000236471	movq	%rsp, %rbp
0000000000236474	pushq	%r14
0000000000236476	pushq	%rbx
0000000000236477	movq	%rdi, %rbx
000000000023647a	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000023647f	leaq	0x7fe912(%rip), %rax
0000000000236486	movq	%rax, (%rbx)
0000000000236489	movl	$0x107, %edi                    ## imm = 0x107
000000000023648e	callq	0x3c4fac                        ## symbol stub for: __Znam
0000000000236493	leaq	0x8(%rax), %rcx
0000000000236497	negl	%ecx
0000000000236499	andl	$0x1f, %ecx
000000000023649c	leaq	(%rcx,%rax), %rdx
00000000002364a0	addq	$0x8, %rdx
00000000002364a4	movq	%rax, (%rcx,%rax)
00000000002364a8	xorps	%xmm0, %xmm0
00000000002364ab	movaps	%xmm0, 0x8(%rcx,%rax)
00000000002364b0	movaps	%xmm0, 0x18(%rcx,%rax)
00000000002364b5	movaps	%xmm0, 0x28(%rcx,%rax)
00000000002364ba	movaps	%xmm0, 0x38(%rcx,%rax)
00000000002364bf	movaps	%xmm0, 0x48(%rcx,%rax)
00000000002364c4	movaps	%xmm0, 0x58(%rcx,%rax)
00000000002364c9	movaps	%xmm0, 0x68(%rcx,%rax)
00000000002364ce	movaps	%xmm0, 0x78(%rcx,%rax)
00000000002364d3	movaps	%xmm0, 0x88(%rcx,%rax)
00000000002364db	movaps	%xmm0, 0x98(%rcx,%rax)
00000000002364e3	movaps	%xmm0, 0xa8(%rcx,%rax)
00000000002364eb	movaps	%xmm0, 0xb8(%rcx,%rax)
00000000002364f3	movss	0x1917c5(%rip), %xmm0
00000000002364fb	movaps	%xmm0, 0xd8(%rcx,%rax)
0000000000236503	movaps	%xmm0, 0xc8(%rcx,%rax)
000000000023650b	movq	%rdx, 0x198(%rbx)
0000000000236512	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
0000000000236517	andl	0x10(%rbx), %eax
000000000023651a	orl	$0x400, %eax                    ## imm = 0x400
000000000023651f	movl	%eax, 0x10(%rbx)
0000000000236522	popq	%rbx
0000000000236523	popq	%r14
0000000000236525	popq	%rbp
0000000000236526	retq
0000000000236527	movq	%rax, %r14
000000000023652a	movq	%rbx, %rdi
000000000023652d	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000236532	movq	%r14, %rdi
0000000000236535	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000023653a	nopw	(%rax,%rax)
