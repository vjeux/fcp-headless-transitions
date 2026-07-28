__ZN5HGCGL20ContextIsAcceleratedE14HGGLContextPtri:
000000000014edb0	pushq	%rbp
000000000014edb1	movq	%rsp, %rbp
000000000014edb4	pushq	%rbx
000000000014edb5	pushq	%rax
000000000014edb6	movl	%esi, %ebx
000000000014edb8	callq	__ZNK14HGGLContextPtr3ptrEv     ## HGGLContextPtr::ptr() const
000000000014edbd	movq	%rax, %rdi
000000000014edc0	callq	0x3c4c5e                        ## symbol stub for: _CGLGetPixelFormat
000000000014edc5	leaq	-0xc(%rbp), %rcx
000000000014edc9	movq	%rax, %rdi
000000000014edcc	movl	%ebx, %esi
000000000014edce	movl	$0x49, %edx
000000000014edd3	callq	0x3c4c3a                        ## symbol stub for: _CGLDescribePixelFormat
000000000014edd8	cmpl	$0x0, -0xc(%rbp)
000000000014eddc	setne	%al
000000000014eddf	addq	$0x8, %rsp
000000000014ede3	popq	%rbx
000000000014ede4	popq	%rbp
000000000014ede5	retq
000000000014ede6	nopw	%cs:(%rax,%rax)
