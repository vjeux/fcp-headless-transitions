=== __ZN19FFAVFTimecodeCursorC2EP16FFAVFMediaReaderP14AVSampleCursor ===
__ZN19FFAVFTimecodeCursorC2EP16FFAVFMediaReaderP14AVSampleCursor:
0000000000df6a00	pushq	%rbp
0000000000df6a01	movq	%rsp, %rbp
0000000000df6a04	pushq	%rbx
0000000000df6a05	pushq	%rax
0000000000df6a06	movq	%rdi, %rbx
0000000000df6a09	leaq	0xb1eeb0(%rip), %rax
0000000000df6a10	movq	%rax, (%rdi)
0000000000df6a13	movq	%rsi, 0x8(%rdi)
0000000000df6a17	movq	%rdx, %rdi
0000000000df6a1a	callq	*0xaf6cf0(%rip)                 ## literal pool symbol address: _objc_retain
0000000000df6a20	movq	%rax, 0x10(%rbx)
0000000000df6a24	movq	0x8(%rbx), %rdi
0000000000df6a28	addq	$0x8, %rsp
0000000000df6a2c	popq	%rbx
0000000000df6a2d	popq	%rbp
0000000000df6a2e	jmp	__ZN20FFMediaReaderService17retainMediaReaderEP13FFMediaReader ## FFMediaReaderService::retainMediaReader(FFMediaReader*)
0000000000df6a33	nopw	%cs:(%rax,%rax)
=== __ZN19FFAVFTimecodeCursorD0Ev ===
__ZN19FFAVFTimecodeCursorD0Ev:
0000000001488f60	pushq	%rbp
0000000001488f61	movq	%rsp, %rbp
0000000001488f64	ud2
0000000001488f66	nopw	%cs:(%rax,%rax)
=== __ZN19FFAVFTimecodeCursorD1Ev ===
__ZN19FFAVFTimecodeCursorD1Ev:
0000000001488f50	pushq	%rbp
0000000001488f51	movq	%rsp, %rbp
0000000001488f54	ud2
0000000001488f56	nopw	%cs:(%rax,%rax)
=== __ZN19FFAVFTimecodeCursorD2Ev ===
__ZN19FFAVFTimecodeCursorD2Ev:
0000000000df6a40	pushq	%rbp
0000000000df6a41	movq	%rsp, %rbp
0000000000df6a44	pushq	%rbx
0000000000df6a45	pushq	%rax
0000000000df6a46	movq	%rdi, %rbx
0000000000df6a49	leaq	0xb1ee70(%rip), %rax
0000000000df6a50	movq	%rax, (%rdi)
0000000000df6a53	movq	0x10(%rdi), %rdi
0000000000df6a57	callq	*0xaf6cab(%rip)                 ## literal pool symbol address: _objc_release
0000000000df6a5d	movq	0x8(%rbx), %rdi
0000000000df6a61	callq	__ZN20FFMediaReaderService18releaseMediaReaderEP13FFMediaReader ## FFMediaReaderService::releaseMediaReader(FFMediaReader*)
0000000000df6a66	addq	$0x8, %rsp
0000000000df6a6a	popq	%rbx
0000000000df6a6b	popq	%rbp
0000000000df6a6c	retq
0000000000df6a6d	movq	%rax, %rdi
0000000000df6a70	callq	___clang_call_terminate
0000000000df6a75	nopw	%cs:(%rax,%rax)
