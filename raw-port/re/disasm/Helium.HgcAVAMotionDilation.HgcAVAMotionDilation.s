__ZN20HgcAVAMotionDilationC1Ev:
0000000000216700	pushq	%rbp
0000000000216701	movq	%rsp, %rbp
0000000000216704	pushq	%r14
0000000000216706	pushq	%rbx
0000000000216707	movq	%rdi, %rbx
000000000021670a	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000021670f	leaq	0x819ad2(%rip), %rax
0000000000216716	movq	%rax, (%rbx)
0000000000216719	movl	$0x87, %edi
000000000021671e	callq	0x3c4fac                        ## symbol stub for: __Znam
0000000000216723	leaq	0x8(%rax), %rcx
0000000000216727	negl	%ecx
0000000000216729	andl	$0x1f, %ecx
000000000021672c	leaq	(%rcx,%rax), %rdx
0000000000216730	addq	$0x8, %rdx
0000000000216734	movq	%rax, (%rcx,%rax)
0000000000216738	movaps	0x1b1501(%rip), %xmm0
000000000021673f	movaps	%xmm0, 0x18(%rcx,%rax)
0000000000216744	movaps	%xmm0, 0x8(%rcx,%rax)
0000000000216749	xorps	%xmm0, %xmm0
000000000021674c	movaps	%xmm0, 0x28(%rcx,%rax)
0000000000216751	movaps	%xmm0, 0x38(%rcx,%rax)
0000000000216756	movaps	0x6494e3(%rip), %xmm0
000000000021675d	movaps	%xmm0, 0x58(%rcx,%rax)
0000000000216762	movaps	%xmm0, 0x48(%rcx,%rax)
0000000000216767	movq	%rdx, 0x198(%rbx)
000000000021676e	movq	(%rbx), %rax
0000000000216771	movq	%rbx, %rdi
0000000000216774	xorl	%esi, %esi
0000000000216776	movl	$0x1, %edx
000000000021677b	callq	*0x88(%rax)
0000000000216781	movq	(%rbx), %rax
0000000000216784	movq	%rbx, %rdi
0000000000216787	movl	$0x1, %esi
000000000021678c	movl	$0x1, %edx
0000000000216791	callq	*0x88(%rax)
0000000000216797	movq	(%rbx), %rax
000000000021679a	movq	%rbx, %rdi
000000000021679d	movl	$0x2, %esi
00000000002167a2	movl	$0x1, %edx
00000000002167a7	callq	*0x88(%rax)
00000000002167ad	movl	$0xfffff9fe, %eax               ## imm = 0xFFFFF9FE
00000000002167b2	andl	0x10(%rbx), %eax
00000000002167b5	orl	$0x401, %eax                    ## imm = 0x401
00000000002167ba	movl	%eax, 0x10(%rbx)
00000000002167bd	popq	%rbx
00000000002167be	popq	%r14
00000000002167c0	popq	%rbp
00000000002167c1	retq
00000000002167c2	movq	%rax, %r14
00000000002167c5	movq	%rbx, %rdi
00000000002167c8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000002167cd	movq	%r14, %rdi
00000000002167d0	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000002167d5	nopw	%cs:(%rax,%rax)
