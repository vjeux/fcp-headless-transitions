__ZN21HgcAVAMotionDetectionC1Ev:
0000000000214110	pushq	%rbp
0000000000214111	movq	%rsp, %rbp
0000000000214114	pushq	%r14
0000000000214116	pushq	%rbx
0000000000214117	movq	%rdi, %rbx
000000000021411a	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000021411f	leaq	0x81ba02(%rip), %rax
0000000000214126	movq	%rax, (%rbx)
0000000000214129	movl	$0xa7, %edi
000000000021412e	callq	0x3c4fac                        ## symbol stub for: __Znam
0000000000214133	leaq	0x8(%rax), %rcx
0000000000214137	negl	%ecx
0000000000214139	andl	$0x1f, %ecx
000000000021413c	leaq	(%rcx,%rax), %rdx
0000000000214140	addq	$0x8, %rdx
0000000000214144	movq	%rax, (%rcx,%rax)
0000000000214148	movaps	0x1b3ae1(%rip), %xmm0
000000000021414f	movaps	%xmm0, 0x18(%rcx,%rax)
0000000000214154	movaps	%xmm0, 0x8(%rcx,%rax)
0000000000214159	movaps	0x678680(%rip), %xmm0
0000000000214160	movaps	%xmm0, 0x38(%rcx,%rax)
0000000000214165	movaps	%xmm0, 0x28(%rcx,%rax)
000000000021416a	movaps	0x1b3acf(%rip), %xmm0
0000000000214171	movaps	%xmm0, 0x58(%rcx,%rax)
0000000000214176	movaps	%xmm0, 0x48(%rcx,%rax)
000000000021417b	movaps	0x64babe(%rip), %xmm0
0000000000214182	movaps	%xmm0, 0x78(%rcx,%rax)
0000000000214187	movaps	%xmm0, 0x68(%rcx,%rax)
000000000021418c	movq	%rdx, 0x198(%rbx)
0000000000214193	movq	%rbx, %rdi
0000000000214196	xorl	%esi, %esi
0000000000214198	movl	$0x1, %edx
000000000021419d	callq	__ZN6HGNode8SetFlagsEii         ## HGNode::SetFlags(int, int)
00000000002141a2	movq	(%rbx), %rax
00000000002141a5	movq	%rbx, %rdi
00000000002141a8	movl	$0x1, %esi
00000000002141ad	movl	$0x1, %edx
00000000002141b2	callq	*0x88(%rax)
00000000002141b8	movl	$0xfffff9fe, %eax               ## imm = 0xFFFFF9FE
00000000002141bd	andl	0x10(%rbx), %eax
00000000002141c0	orl	$0x401, %eax                    ## imm = 0x401
00000000002141c5	movl	%eax, 0x10(%rbx)
00000000002141c8	popq	%rbx
00000000002141c9	popq	%r14
00000000002141cb	popq	%rbp
00000000002141cc	retq
00000000002141cd	movq	%rax, %r14
00000000002141d0	movq	%rbx, %rdi
00000000002141d3	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000002141d8	movq	%r14, %rdi
00000000002141db	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
