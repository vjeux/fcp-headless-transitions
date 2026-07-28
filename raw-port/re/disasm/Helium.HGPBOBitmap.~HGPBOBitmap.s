__ZN11HGPBOBitmapD0Ev:
00000000000a1380	pushq	%rbp
00000000000a1381	movq	%rsp, %rbp
00000000000a1384	pushq	%rbx
00000000000a1385	pushq	%rax
00000000000a1386	movq	%rdi, %rbx
00000000000a1389	leaq	0x96a638(%rip), %rax
00000000000a1390	movq	%rax, (%rdi)
00000000000a1393	movq	0x80(%rdi), %rdi
00000000000a139a	movq	(%rdi), %rax
00000000000a139d	callq	*0x18(%rax)
00000000000a13a0	movq	%rbx, %rdi
00000000000a13a3	callq	__ZN8HGBitmapD2Ev               ## HGBitmap::~HGBitmap()
00000000000a13a8	movq	%rbx, %rdi
00000000000a13ab	addq	$0x8, %rsp
00000000000a13af	popq	%rbx
00000000000a13b0	popq	%rbp
00000000000a13b1	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000a13b6	movq	%rax, %rdi
00000000000a13b9	callq	___clang_call_terminate
00000000000a13be	nop
