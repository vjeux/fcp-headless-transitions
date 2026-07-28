__ZN13PCShared_baseD0Ev:
00000000000227c2	pushq	%rbp
00000000000227c3	movq	%rsp, %rbp
00000000000227c6	pushq	%rbx
00000000000227c7	pushq	%rax
00000000000227c8	movq	%rdi, %rbx
00000000000227cb	leaq	0x126cde(%rip), %rax
00000000000227d2	movq	%rax, (%rdi)
00000000000227d5	addq	$0x8, %rdi
00000000000227d9	callq	__ZN11PCWeakCountD2Ev           ## PCWeakCount::~PCWeakCount()
00000000000227de	movq	%rbx, %rdi
00000000000227e1	addq	$0x8, %rsp
00000000000227e5	popq	%rbx
00000000000227e6	popq	%rbp
00000000000227e7	jmp	0xde6c0                         ## symbol stub for: __ZdlPv
