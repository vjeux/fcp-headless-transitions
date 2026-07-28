__ZN15HGDeinterlaceLAC1Ev:
000000000003e730	pushq	%rbp
000000000003e731	movq	%rsp, %rbp
000000000003e734	pushq	%r15
000000000003e736	pushq	%r14
000000000003e738	pushq	%rbx
000000000003e739	pushq	%rax
000000000003e73a	movq	%rdi, %rbx
000000000003e73d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000003e742	leaq	0x9c7eaf(%rip), %rax
000000000003e749	movq	%rax, (%rbx)
000000000003e74c	movl	$0x0, 0x198(%rbx)
000000000003e756	movl	$0x1b0, %edi                    ## imm = 0x1B0
000000000003e75b	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000003e760	movq	%rax, %r14
000000000003e763	movq	%rax, %rdi
000000000003e766	callq	__ZN17Hgc2DeinterlaceLAC2Ev     ## Hgc2DeinterlaceLA::Hgc2DeinterlaceLA()
000000000003e76b	leaq	0x9c80c6(%rip), %rax
000000000003e772	movq	%rax, (%r14)
000000000003e775	movq	%r14, 0x1a8(%rbx)
000000000003e77c	addq	$0x8, %rsp
000000000003e780	popq	%rbx
000000000003e781	popq	%r14
000000000003e783	popq	%r15
000000000003e785	popq	%rbp
000000000003e786	retq
000000000003e787	movq	%rax, %r15
000000000003e78a	movq	%r14, %rdi
000000000003e78d	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000003e792	movq	%rbx, %rdi
000000000003e795	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000003e79a	movq	%r15, %rdi
000000000003e79d	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000003e7a2	movq	%rax, %r15
000000000003e7a5	movq	%rbx, %rdi
000000000003e7a8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000003e7ad	movq	%r15, %rdi
000000000003e7b0	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000003e7b5	nopw	%cs:(%rax,%rax)
