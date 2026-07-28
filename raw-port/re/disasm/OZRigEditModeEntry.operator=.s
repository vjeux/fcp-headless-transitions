__ZN18OZRigEditModeEntryaSERKS_:
000000000056d330	pushq	%rbp
000000000056d331	movq	%rsp, %rbp
000000000056d334	pushq	%r14
000000000056d336	pushq	%rbx
000000000056d337	movq	%rsi, %rbx
000000000056d33a	movq	%rdi, %r14
000000000056d33d	callq	0x6dd722                        ## symbol stub for: __ZN12OZChannelRefaSERKS_
000000000056d342	movq	0x18(%rbx), %rax
000000000056d346	movq	%rax, 0x18(%r14)
000000000056d34a	movq	%r14, %rax
000000000056d34d	popq	%rbx
000000000056d34e	popq	%r14
000000000056d350	popq	%rbp
000000000056d351	retq
000000000056d352	nopw	%cs:(%rax,%rax)
