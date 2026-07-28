__ZN19FFAVFMetadataCursorC2EP16FFAVFMediaReaderP14AVSampleCursori:
0000000000df6b00	pushq	%rbp
0000000000df6b01	movq	%rsp, %rbp
0000000000df6b04	pushq	%rbx
0000000000df6b05	pushq	%rax
0000000000df6b06	movq	%rdi, %rbx
0000000000df6b09	leaq	0xb1ede8(%rip), %rax
0000000000df6b10	movq	%rax, (%rdi)
0000000000df6b13	movq	%rsi, 0x8(%rdi)
0000000000df6b17	movl	%ecx, 0x10(%rdi)
0000000000df6b1a	movq	%rdx, %rdi
0000000000df6b1d	callq	*0xaf6bed(%rip)                 ## literal pool symbol address: _objc_retain
0000000000df6b23	movq	%rax, 0x18(%rbx)
0000000000df6b27	movq	0x8(%rbx), %rdi
0000000000df6b2b	addq	$0x8, %rsp
0000000000df6b2f	popq	%rbx
0000000000df6b30	popq	%rbp
0000000000df6b31	jmp	__ZN20FFMediaReaderService17retainMediaReaderEP13FFMediaReader ## FFMediaReaderService::retainMediaReader(FFMediaReader*)
0000000000df6b36	nopw	%cs:(%rax,%rax)
