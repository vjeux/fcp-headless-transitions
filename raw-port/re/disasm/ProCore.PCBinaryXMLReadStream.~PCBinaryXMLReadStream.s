__ZN21PCBinaryXMLReadStreamD0Ev:
000000000006481c	pushq	%rbp
000000000006481d	movq	%rsp, %rbp
0000000000064820	pushq	%rbx
0000000000064821	pushq	%rax
0000000000064822	movq	%rdi, %rbx
0000000000064825	leaq	0xe6d74(%rip), %rax
000000000006482c	movq	%rax, (%rdi)
000000000006482f	addq	$0xa8, %rdi
0000000000064836	callq	__ZN5PCURLD1Ev                  ## PCURL::~PCURL()
000000000006483b	movq	%rbx, %rdi
000000000006483e	callq	__ZN22PCSerializerReadStreamD2Ev ## PCSerializerReadStream::~PCSerializerReadStream()
0000000000064843	movq	%rbx, %rdi
0000000000064846	addq	$0x8, %rsp
000000000006484a	popq	%rbx
000000000006484b	popq	%rbp
000000000006484c	jmp	0xde6c0                         ## symbol stub for: __ZdlPv
0000000000064851	nop
