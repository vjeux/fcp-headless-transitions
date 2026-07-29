__ZN22OZMaterialBumpMapLayer15getImageNodeIDsERNSt3__14listIjNS0_9allocatorIjEEEE:
0000000000440c20	pushq	%rbp
0000000000440c21	movq	%rsp, %rbp
0000000000440c24	pushq	%r15
0000000000440c26	pushq	%r14
0000000000440c28	pushq	%r12
0000000000440c2a	pushq	%rbx
0000000000440c2b	movq	%rsi, %rbx
0000000000440c2e	movq	%rdi, %r14
0000000000440c31	addq	$0x5f0, %rdi                    ## imm = 0x5F0
0000000000440c38	movq	0x3e38d1(%rip), %r15            ## literal pool symbol address: _kCMTimeZero
0000000000440c3f	xorps	%xmm0, %xmm0
0000000000440c42	movq	%r15, %rsi
0000000000440c45	callq	0x6dfa8c                        ## symbol stub for: __ZNK9OZChannel14getValueAsUintERK6CMTimed
0000000000440c4a	movl	%eax, %r12d
0000000000440c4d	movl	$0x18, %edi
0000000000440c52	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000440c57	movl	%r12d, 0x10(%rax)
0000000000440c5b	movq	%rbx, 0x8(%rax)
0000000000440c5f	movq	(%rbx), %rcx
0000000000440c62	movq	%rcx, (%rax)
0000000000440c65	movq	%rax, 0x8(%rcx)
0000000000440c69	movq	%rax, (%rbx)
0000000000440c6c	incq	0x10(%rbx)
0000000000440c70	addq	$0x15f8, %r14                   ## imm = 0x15F8
0000000000440c77	xorps	%xmm0, %xmm0
0000000000440c7a	movq	%r14, %rdi
0000000000440c7d	movq	%r15, %rsi
0000000000440c80	callq	0x6dfa8c                        ## symbol stub for: __ZNK9OZChannel14getValueAsUintERK6CMTimed
0000000000440c85	movl	%eax, %r14d
0000000000440c88	movl	$0x18, %edi
0000000000440c8d	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000440c92	movl	%r14d, 0x10(%rax)
0000000000440c96	movq	%rbx, 0x8(%rax)
0000000000440c9a	movq	(%rbx), %rcx
0000000000440c9d	movq	%rcx, (%rax)
0000000000440ca0	movq	%rax, 0x8(%rcx)
0000000000440ca4	movq	%rax, (%rbx)
0000000000440ca7	incq	0x10(%rbx)
0000000000440cab	popq	%rbx
0000000000440cac	popq	%r12
0000000000440cae	popq	%r14
0000000000440cb0	popq	%r15
0000000000440cb2	popq	%rbp
0000000000440cb3	retq
0000000000440cb4	nopw	%cs:(%rax,%rax)
