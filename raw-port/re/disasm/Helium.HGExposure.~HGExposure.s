__ZN10HGExposureD0Ev:
00000000001a8fe0	pushq	%rbp
00000000001a8fe1	movq	%rsp, %rbp
00000000001a8fe4	pushq	%rbx
00000000001a8fe5	pushq	%rax
00000000001a8fe6	movq	%rdi, %rbx
00000000001a8fe9	leaq	0x87c958(%rip), %rax
00000000001a8ff0	movq	%rax, (%rdi)
00000000001a8ff3	movq	0x1f0(%rdi), %rdi
00000000001a8ffa	testq	%rdi, %rdi
00000000001a8ffd	je	0x1a9005
00000000001a8fff	movq	(%rdi), %rax
00000000001a9002	callq	*0x18(%rax)
00000000001a9005	movq	%rbx, %rdi
00000000001a9008	callq	__ZN13HGColorMatrixD2Ev         ## HGColorMatrix::~HGColorMatrix()
00000000001a900d	movq	%rbx, %rdi
00000000001a9010	addq	$0x8, %rsp
00000000001a9014	popq	%rbx
00000000001a9015	popq	%rbp
00000000001a9016	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001a901b	movq	%rax, %rdi
00000000001a901e	callq	___clang_call_terminate
00000000001a9023	nopw	%cs:(%rax,%rax)
