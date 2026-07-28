__ZN13LiImageFilter8copyFromEPKS_:
000000000005c84c	pushq	%rbp
000000000005c84d	movq	%rsp, %rbp
000000000005c850	pushq	%r15
000000000005c852	pushq	%r14
000000000005c854	pushq	%r12
000000000005c856	pushq	%rbx
000000000005c857	subq	$0x10, %rsp
000000000005c85b	movq	%rsi, %r14
000000000005c85e	movq	%rdi, %rbx
000000000005c861	movq	0x10(%rsi), %rax
000000000005c865	movq	%rax, 0x10(%rdi)
000000000005c869	leaq	0x18(%rdi), %r15
000000000005c86d	addq	$0x18, %rsi
000000000005c871	leaq	-0x28(%rbp), %r12
000000000005c875	movq	%r12, %rdi
000000000005c878	callq	0x1c4336                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000005c87d	movq	%r15, %rdi
000000000005c880	movq	%r12, %rsi
000000000005c883	callq	0x1c4348                        ## symbol stub for: __ZN13PCSharedCountaSES_
000000000005c888	leaq	-0x28(%rbp), %rdi
000000000005c88c	callq	0x1c4342                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000005c891	movl	0x20(%r14), %eax
000000000005c895	movl	%eax, 0x20(%rbx)
000000000005c898	addq	$0x10, %rsp
000000000005c89c	popq	%rbx
000000000005c89d	popq	%r12
000000000005c89f	popq	%r14
000000000005c8a1	popq	%r15
000000000005c8a3	popq	%rbp
000000000005c8a4	retq
000000000005c8a5	movq	%rax, %rbx
000000000005c8a8	leaq	-0x28(%rbp), %rdi
000000000005c8ac	callq	0x1c4342                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000005c8b1	movq	%rbx, %rdi
000000000005c8b4	callq	0x1c40c6                        ## symbol stub for: __Unwind_Resume
000000000005c8b9	nop
