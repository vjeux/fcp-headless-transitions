__ZN12KilledPlugin12compareUUIDsEPK8__CFUUIDS2_:
000000000050c530	pushq	%rbp
000000000050c531	movq	%rsp, %rbp
000000000050c534	pushq	%r15
000000000050c536	pushq	%r14
000000000050c538	pushq	%rbx
000000000050c539	pushq	%rax
000000000050c53a	movq	%rsi, %rbx
000000000050c53d	movq	%rdi, %rsi
000000000050c540	movq	0x31a4a1(%rip), %rax            ## literal pool symbol address: _kCFAllocatorDefault
000000000050c547	movq	(%rax), %r14
000000000050c54a	movq	%r14, %rdi
000000000050c54d	callq	0x6dc8ca                        ## symbol stub for: _CFUUIDCreateString
000000000050c552	movq	%rax, %r15
000000000050c555	movq	%r14, %rdi
000000000050c558	movq	%rbx, %rsi
000000000050c55b	callq	0x6dc8ca                        ## symbol stub for: _CFUUIDCreateString
000000000050c560	movq	%rax, %rbx
000000000050c563	movl	$0x1, %edx
000000000050c568	movq	%r15, %rdi
000000000050c56b	movq	%rax, %rsi
000000000050c56e	callq	0x6dc85e                        ## symbol stub for: _CFStringCompare
000000000050c573	movq	%rax, %r14
000000000050c576	movq	%r15, %rdi
000000000050c579	callq	0x6dc810                        ## symbol stub for: _CFRelease
000000000050c57e	movq	%rbx, %rdi
000000000050c581	callq	0x6dc810                        ## symbol stub for: _CFRelease
000000000050c586	movq	%r14, %rax
000000000050c589	addq	$0x8, %rsp
000000000050c58d	popq	%rbx
000000000050c58e	popq	%r14
000000000050c590	popq	%r15
000000000050c592	popq	%rbp
000000000050c593	retq
000000000050c594	nopw	%cs:(%rax,%rax)
