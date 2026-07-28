__ZN21FFAudioPerfRenderHookD0Ev:
0000000000d04270	leaq	0xc0c9d9(%rip), %rax
0000000000d04277	movq	%rax, (%rdi)
0000000000d0427a	leaq	0xc0cb17(%rip), %rax
0000000000d04281	movq	%rax, 0x8(%rdi)
0000000000d04285	movq	0x10(%rdi), %rax
0000000000d04289	testq	%rax, %rax
0000000000d0428c	je	0x1497404                       ## symbol stub for: __ZdlPv
0000000000d04292	pushq	%rbp
0000000000d04293	movq	%rsp, %rbp
0000000000d04296	pushq	%rbx
0000000000d04297	pushq	%rax
0000000000d04298	movq	%rdi, %rbx
0000000000d0429b	movq	%rax, %rdi
0000000000d0429e	callq	0x14973fe                       ## symbol stub for: __ZdaPv
0000000000d042a3	movq	%rbx, %rdi
0000000000d042a6	addq	$0x8, %rsp
0000000000d042aa	popq	%rbx
0000000000d042ab	popq	%rbp
0000000000d042ac	jmp	0x1497404                       ## symbol stub for: __ZdlPv
0000000000d042b1	nopw	%cs:(%rax,%rax)
