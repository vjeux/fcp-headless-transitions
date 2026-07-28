__ZN12HGColorClampC1Eff:
0000000000152030	pushq	%rbp
0000000000152031	movq	%rsp, %rbp
0000000000152034	pushq	%r15
0000000000152036	pushq	%r14
0000000000152038	pushq	%rbx
0000000000152039	subq	$0x28, %rsp
000000000015203d	movaps	%xmm1, -0x40(%rbp)
0000000000152041	movaps	%xmm0, -0x30(%rbp)
0000000000152045	movq	%rdi, %rbx
0000000000152048	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000015204d	leaq	0x8cd664(%rip), %rax
0000000000152054	movq	%rax, (%rbx)
0000000000152057	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000015205c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000152061	movq	%rax, %r14
0000000000152064	movq	%rax, %rdi
0000000000152067	callq	__ZN13HgcColorClampC1Ev         ## HgcColorClamp::HgcColorClamp()
000000000015206c	movq	%r14, 0x198(%rbx)
0000000000152073	movaps	-0x30(%rbp), %xmm0
0000000000152077	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
000000000015207b	movaps	%xmm0, 0x1b0(%rbx)
0000000000152082	movaps	-0x40(%rbp), %xmm0
0000000000152086	shufps	$0x0, %xmm0, %xmm0              ## xmm0 = xmm0[0,0,0,0]
000000000015208a	movaps	%xmm0, 0x1a0(%rbx)
0000000000152091	addq	$0x28, %rsp
0000000000152095	popq	%rbx
0000000000152096	popq	%r14
0000000000152098	popq	%r15
000000000015209a	popq	%rbp
000000000015209b	retq
000000000015209c	movq	%rax, %r15
000000000015209f	movq	%r14, %rdi
00000000001520a2	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001520a7	movq	%rbx, %rdi
00000000001520aa	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001520af	movq	%r15, %rdi
00000000001520b2	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001520b7	movq	%rax, %r15
00000000001520ba	movq	%rbx, %rdi
00000000001520bd	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001520c2	movq	%r15, %rdi
00000000001520c5	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001520ca	nopw	(%rax,%rax)
