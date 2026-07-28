__ZN25HGPremultiplyWhiteToBlackC1Ev:
0000000000157ef0	pushq	%rbp
0000000000157ef1	movq	%rsp, %rbp
0000000000157ef4	pushq	%r15
0000000000157ef6	pushq	%r14
0000000000157ef8	pushq	%rbx
0000000000157ef9	pushq	%rax
0000000000157efa	movq	%rdi, %rbx
0000000000157efd	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000157f02	leaq	0x8c86ff(%rip), %rax
0000000000157f09	movq	%rax, (%rbx)
0000000000157f0c	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000157f11	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000157f16	movq	%rax, %r14
0000000000157f19	movq	%rax, %rdi
0000000000157f1c	callq	__ZN26HgcPremultiplyWhiteToBlackC1Ev ## HgcPremultiplyWhiteToBlack::HgcPremultiplyWhiteToBlack()
0000000000157f21	movq	%r14, 0x198(%rbx)
0000000000157f28	addq	$0x8, %rsp
0000000000157f2c	popq	%rbx
0000000000157f2d	popq	%r14
0000000000157f2f	popq	%r15
0000000000157f31	popq	%rbp
0000000000157f32	retq
0000000000157f33	movq	%rax, %r15
0000000000157f36	movq	%r14, %rdi
0000000000157f39	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000157f3e	movq	%rbx, %rdi
0000000000157f41	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157f46	movq	%r15, %rdi
0000000000157f49	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157f4e	movq	%rax, %r15
0000000000157f51	movq	%rbx, %rdi
0000000000157f54	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157f59	movq	%r15, %rdi
0000000000157f5c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157f61	nopw	%cs:(%rax,%rax)
