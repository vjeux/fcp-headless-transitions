__ZN13HGPremultiplyC2Ev:
0000000000157a70	pushq	%rbp
0000000000157a71	movq	%rsp, %rbp
0000000000157a74	pushq	%r15
0000000000157a76	pushq	%r14
0000000000157a78	pushq	%rbx
0000000000157a79	pushq	%rax
0000000000157a7a	movq	%rdi, %rbx
0000000000157a7d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000157a82	leaq	0x8c86ff(%rip), %rax
0000000000157a89	movq	%rax, (%rbx)
0000000000157a8c	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000157a91	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000157a96	movq	%rax, %r14
0000000000157a99	movq	%rax, %rdi
0000000000157a9c	callq	__ZN14HgcPremultiplyC1Ev        ## HgcPremultiply::HgcPremultiply()
0000000000157aa1	movq	%r14, 0x198(%rbx)
0000000000157aa8	addq	$0x8, %rsp
0000000000157aac	popq	%rbx
0000000000157aad	popq	%r14
0000000000157aaf	popq	%r15
0000000000157ab1	popq	%rbp
0000000000157ab2	retq
0000000000157ab3	movq	%rax, %r15
0000000000157ab6	movq	%r14, %rdi
0000000000157ab9	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000157abe	movq	%rbx, %rdi
0000000000157ac1	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157ac6	movq	%r15, %rdi
0000000000157ac9	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157ace	movq	%rax, %r15
0000000000157ad1	movq	%rbx, %rdi
0000000000157ad4	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157ad9	movq	%r15, %rdi
0000000000157adc	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000157ae1	nopw	%cs:(%rax,%rax)
__ZN13HGPremultiplyC1Ev:
