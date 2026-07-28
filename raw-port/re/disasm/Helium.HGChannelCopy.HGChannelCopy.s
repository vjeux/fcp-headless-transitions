__ZN13HGChannelCopyC1Ev:
000000000017a4d0	pushq	%rbp
000000000017a4d1	movq	%rsp, %rbp
000000000017a4d4	pushq	%r15
000000000017a4d6	pushq	%r14
000000000017a4d8	pushq	%rbx
000000000017a4d9	pushq	%rax
000000000017a4da	movq	%rdi, %rbx
000000000017a4dd	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000017a4e2	leaq	0x8a85bf(%rip), %rax
000000000017a4e9	movq	%rax, (%rbx)
000000000017a4ec	movl	$0x1a0, %edi                    ## imm = 0x1A0
000000000017a4f1	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000017a4f6	movq	%rax, %r14
000000000017a4f9	movq	%rax, %rdi
000000000017a4fc	callq	__ZN14HgcChannelCopyC1Ev        ## HgcChannelCopy::HgcChannelCopy()
000000000017a501	movq	%r14, 0x198(%rbx)
000000000017a508	addq	$0x8, %rsp
000000000017a50c	popq	%rbx
000000000017a50d	popq	%r14
000000000017a50f	popq	%r15
000000000017a511	popq	%rbp
000000000017a512	retq
000000000017a513	movq	%rax, %r15
000000000017a516	movq	%r14, %rdi
000000000017a519	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000017a51e	movq	%rbx, %rdi
000000000017a521	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000017a526	movq	%r15, %rdi
000000000017a529	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000017a52e	movq	%rax, %r15
000000000017a531	movq	%rbx, %rdi
000000000017a534	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000017a539	movq	%r15, %rdi
000000000017a53c	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000017a541	nopw	%cs:(%rax,%rax)
