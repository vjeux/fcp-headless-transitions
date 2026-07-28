__ZN8HGSMixer6GetROIEP10HGRendereri6HGRect:
00000000000401a0	movq	%rcx, %rax
00000000000401a3	cmpl	$0x2, %edx
00000000000401a6	jb	0x401bb
00000000000401a8	pushq	%rbp
00000000000401a9	movq	%rsp, %rbp
00000000000401ac	leaq	_HGRectNull(%rip), %rcx
00000000000401b3	movq	(%rcx), %rax
00000000000401b6	movq	0x8(%rcx), %r8
00000000000401ba	popq	%rbp
00000000000401bb	movq	%r8, %rdx
00000000000401be	retq
00000000000401bf	addb	%dl, 0x48(%rbp)
00000000000401c2	movl	%esp, %ebp
00000000000401c4	pushq	%r14
00000000000401c6	pushq	%rbx
00000000000401c7	movq	%rdi, %rbx
00000000000401ca	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000401cf	leaq	0x9c6dda(%rip), %rax
00000000000401d6	movq	%rax, (%rbx)
00000000000401d9	xorps	%xmm0, %xmm0
00000000000401dc	movups	%xmm0, 0x198(%rbx)
00000000000401e3	movl	$0x0, 0x1a8(%rbx)
00000000000401ed	movabsq	$0x1b3f800000, %rax             ## imm = 0x1B3F800000
00000000000401f7	movq	%rax, 0x1e0(%rbx)
00000000000401fe	movl	$0x17, 0x1e8(%rbx)
0000000000040208	movb	$0x1, 0x1ec(%rbx)
000000000004020f	movabsq	$0x1000000005, %rax             ## imm = 0x1000000005
0000000000040219	movq	%rax, 0x1f0(%rbx)
0000000000040220	movups	%xmm0, 0x1f8(%rbx)
0000000000040227	movups	%xmm0, 0x208(%rbx)
000000000004022e	movups	%xmm0, 0x214(%rbx)
0000000000040235	movq	%rbx, %rdi
0000000000040238	xorl	%esi, %esi
000000000004023a	movl	$0x1002, %edx                   ## imm = 0x1002
000000000004023f	callq	__ZN6HGNode8SetFlagsEii         ## HGNode::SetFlags(int, int)
0000000000040244	movq	(%rbx), %rax
0000000000040247	movq	%rbx, %rdi
000000000004024a	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
000000000004024f	movl	$0x1402, %edx                   ## imm = 0x1402
0000000000040254	callq	*0x88(%rax)
000000000004025a	popq	%rbx
000000000004025b	popq	%r14
000000000004025d	popq	%rbp
000000000004025e	retq
000000000004025f	movq	%rax, %r14
0000000000040262	movq	%rbx, %rdi
0000000000040265	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000004026a	movq	%r14, %rdi
000000000004026d	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000040272	nopw	%cs:(%rax,%rax)
