__ZN5HGCGL17ContextRendererIDE14HGGLContextPtri:
000000000014edf0	pushq	%rbp
000000000014edf1	movq	%rsp, %rbp
000000000014edf4	pushq	%rbx
000000000014edf5	pushq	%rax
000000000014edf6	movl	%esi, %ebx
000000000014edf8	callq	__ZNK14HGGLContextPtr3ptrEv     ## HGGLContextPtr::ptr() const
000000000014edfd	movq	%rax, %rdi
000000000014ee00	callq	0x3c4c5e                        ## symbol stub for: _CGLGetPixelFormat
000000000014ee05	leaq	-0xc(%rbp), %rcx
000000000014ee09	movq	%rax, %rdi
000000000014ee0c	movl	%ebx, %esi
000000000014ee0e	movl	$0x46, %edx
000000000014ee13	callq	0x3c4c3a                        ## symbol stub for: _CGLDescribePixelFormat
000000000014ee18	movl	-0xc(%rbp), %eax
000000000014ee1b	addq	$0x8, %rsp
000000000014ee1f	popq	%rbx
000000000014ee20	popq	%rbp
000000000014ee21	retq
000000000014ee22	nopw	%cs:(%rax,%rax)
