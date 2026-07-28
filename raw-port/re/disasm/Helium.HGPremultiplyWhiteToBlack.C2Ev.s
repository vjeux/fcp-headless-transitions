__ZN25HGPremultiplyWhiteToBlackC2Ev:
0000000000157e70	pushq	%rbp
0000000000157e71	movq	%rsp, %rbp
0000000000157e74	pushq	%r15
0000000000157e76	pushq	%r14
0000000000157e78	pushq	%rbx
0000000000157e79	pushq	%rax
0000000000157e7a	movq	%rdi, %rbx
0000000000157e7d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000157e82	leaq	0x8c877f(%rip), %rax
0000000000157e89	movq	%rax, (%rbx)
0000000000157e8c	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000157e91	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000157e96	movq	%rax, %r14
0000000000157e99	movq	%rax, %rdi
0000000000157e9c	callq	__ZN26HgcPremultiplyWhiteToBlackC1Ev ## HgcPremultiplyWhiteToBlack::HgcPremultiplyWhiteToBlack()
0000000000157ea1	movq	%r14, 0x198(%rbx)
0000000000157ea8	addq	$0x8, %rsp
0000000000157eac	popq	%rbx
0000000000157ead	popq	%r14
0000000000157eaf	popq	%r15
0000000000157eb1	popq	%rbp
0000000000157eb2	retq
0000000000157eb3	movq	%rax, %r15
0000000000157eb6	movq	%r14, %rdi
0000000000157eb9	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000157ebe	movq	%rbx, %rdi
0000000000157ec1	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157ec6	movq	%r15, %rdi
0000000000157ec9	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157ece	movq	%rax, %r15
0000000000157ed1	movq	%rbx, %rdi
0000000000157ed4	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157ed9	movq	%r15, %rdi
0000000000157edc	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157ee1	nopw	%cs:(%rax,%rax)
