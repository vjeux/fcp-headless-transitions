__ZN21FFAudioPerfRenderHookD1Ev:
0000000000d04230	pushq	%rbp
0000000000d04231	movq	%rsp, %rbp
0000000000d04234	pushq	%rbx
0000000000d04235	pushq	%rax
0000000000d04236	movq	%rdi, %rbx
0000000000d04239	leaq	0xc0ca10(%rip), %rax
0000000000d04240	movq	%rax, (%rdi)
0000000000d04243	leaq	0xc0cb4e(%rip), %rax
0000000000d0424a	movq	%rax, 0x8(%rdi)
0000000000d0424e	movq	0x10(%rdi), %rdi
0000000000d04252	testq	%rdi, %rdi
0000000000d04255	je	0xd04264
0000000000d04257	callq	0x14973fe                       ## symbol stub for: __ZdaPv
0000000000d0425c	movq	$0x0, 0x10(%rbx)
0000000000d04264	addq	$0x8, %rsp
0000000000d04268	popq	%rbx
0000000000d04269	popq	%rbp
0000000000d0426a	retq
0000000000d0426b	nopl	(%rax,%rax)
