__ZN5HGCGL17NumVirtualScreensE14HGGLContextPtr:
000000000014ee30	pushq	%rbp
000000000014ee31	movq	%rsp, %rbp
000000000014ee34	pushq	%r14
000000000014ee36	pushq	%rbx
000000000014ee37	subq	$0x10, %rsp
000000000014ee3b	movq	%rdi, %r14
000000000014ee3e	movl	$0x0, -0x14(%rbp)
000000000014ee45	callq	__ZNK14HGGLContextPtr3ptrEv     ## HGGLContextPtr::ptr() const
000000000014ee4a	xorl	%ebx, %ebx
000000000014ee4c	testq	%rax, %rax
000000000014ee4f	je	0x14ee7c
000000000014ee51	movq	%r14, %rdi
000000000014ee54	callq	__ZNK14HGGLContextPtr3ptrEv     ## HGGLContextPtr::ptr() const
000000000014ee59	movq	%rax, %rdi
000000000014ee5c	callq	0x3c4c5e                        ## symbol stub for: _CGLGetPixelFormat
000000000014ee61	testq	%rax, %rax
000000000014ee64	je	0x14ee7c
000000000014ee66	leaq	-0x14(%rbp), %rcx
000000000014ee6a	movq	%rax, %rdi
000000000014ee6d	xorl	%esi, %esi
000000000014ee6f	movl	$0x80, %edx
000000000014ee74	callq	0x3c4c3a                        ## symbol stub for: _CGLDescribePixelFormat
000000000014ee79	movl	-0x14(%rbp), %ebx
000000000014ee7c	movl	%ebx, %eax
000000000014ee7e	addq	$0x10, %rsp
000000000014ee82	popq	%rbx
000000000014ee83	popq	%r14
000000000014ee85	popq	%rbp
000000000014ee86	retq
000000000014ee87	nopw	(%rax,%rax)
