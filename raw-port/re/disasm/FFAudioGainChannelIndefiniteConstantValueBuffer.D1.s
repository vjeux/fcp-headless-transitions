// Extracted from /tmp/Flexo_tV.txt lines 3600108..3600122 (otool -tV).
__ZN47FFAudioGainChannelIndefiniteConstantValueBufferD1Ev:
0000000000e63cb0	pushq	%rbp
0000000000e63cb1	movq	%rsp, %rbp
0000000000e63cb4	leaq	0xab4205(%rip), %rax    ; &vtable @0x1917ec0
0000000000e63cbb	movq	%rax, (%rdi)
0000000000e63cbe	movq	0x8(%rdi), %rax
0000000000e63cc2	testq	%rax, %rax
0000000000e63cc5	je	0xe63cd4
0000000000e63cc7	movq	%rax, 0x10(%rdi)
0000000000e63ccb	movq	%rax, %rdi
0000000000e63cce	popq	%rbp
0000000000e63ccf	jmp	0x1497404               ; symbol stub for: __ZdlPv
0000000000e63cd4	popq	%rbp
0000000000e63cd5	retq
0000000000e63cd6	nopw	%cs:(%rax,%rax)
