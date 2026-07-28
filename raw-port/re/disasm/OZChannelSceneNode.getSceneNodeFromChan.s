__ZN18OZChannelSceneNode20getSceneNodeFromChanEP13OZChannelBase:
0000000000213d70	pushq	%rbp
0000000000213d71	movq	%rsp, %rbp
0000000000213d74	pushq	%r15
0000000000213d76	pushq	%r14
0000000000213d78	pushq	%r12
0000000000213d7a	pushq	%rbx
0000000000213d7b	testq	%rdi, %rdi
0000000000213d7e	je	0x213dc0
0000000000213d80	movq	%rdi, %r14
0000000000213d83	movq	0x60e9a6(%rip), %r15            ## literal pool symbol address: __ZTI13OZChannelBase
0000000000213d8a	leaq	__ZTI18OZChannelSceneNode(%rip), %r12 ## typeinfo for OZChannelSceneNode
0000000000213d91	xorl	%ebx, %ebx
0000000000213d93	nopw	%cs:(%rax,%rax)
0000000000213da0	movq	%r14, %rdi
0000000000213da3	movq	%r15, %rsi
0000000000213da6	movq	%r12, %rdx
0000000000213da9	xorl	%ecx, %ecx
0000000000213dab	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000213db0	testq	%rax, %rax
0000000000213db3	jne	0x213dc4
0000000000213db5	movq	0x30(%r14), %r14
0000000000213db9	testq	%r14, %r14
0000000000213dbc	jne	0x213da0
0000000000213dbe	jmp	0x213dcb
0000000000213dc0	xorl	%ebx, %ebx
0000000000213dc2	jmp	0x213dcb
0000000000213dc4	movq	0x100(%rax), %rbx
0000000000213dcb	movq	%rbx, %rax
0000000000213dce	popq	%rbx
0000000000213dcf	popq	%r12
0000000000213dd1	popq	%r14
0000000000213dd3	popq	%r15
0000000000213dd5	popq	%rbp
0000000000213dd6	retq
0000000000213dd7	nopw	(%rax,%rax)
