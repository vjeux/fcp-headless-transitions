__ZN5HGCGL20GetCurrentRendererIDE14HGGLContextPtr:
000000000014ee90	pushq	%rbp
000000000014ee91	movq	%rsp, %rbp
000000000014ee94	subq	$0x10, %rsp
000000000014ee98	callq	__ZNK14HGGLContextPtr3ptrEv     ## HGGLContextPtr::ptr() const
000000000014ee9d	leaq	-0x4(%rbp), %rdx
000000000014eea1	movq	%rax, %rdi
000000000014eea4	movl	$0x135, %esi                    ## imm = 0x135
000000000014eea9	callq	0x3c4c58                        ## symbol stub for: _CGLGetParameter
000000000014eeae	movl	-0x4(%rbp), %eax
000000000014eeb1	addq	$0x10, %rsp
000000000014eeb5	popq	%rbp
000000000014eeb6	retq
000000000014eeb7	nopw	(%rax,%rax)
