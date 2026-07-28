__ZN17HGCFDataRefHolderD0Ev:
0000000000007ff0	pushq	%rbp
0000000000007ff1	movq	%rsp, %rbp
0000000000007ff4	pushq	%rbx
0000000000007ff5	pushq	%rax
0000000000007ff6	movq	%rdi, %rbx
0000000000007ff9	leaq	0x9fb7e0(%rip), %rax
0000000000008000	movq	%rax, (%rdi)
0000000000008003	movq	0x10(%rdi), %rdi
0000000000008007	callq	0x3c4b1a                        ## symbol stub for: _CFRelease
000000000000800c	movq	%rbx, %rdi
000000000000800f	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
0000000000008014	movq	%rbx, %rdi
0000000000008017	addq	$0x8, %rsp
000000000000801b	popq	%rbx
000000000000801c	popq	%rbp
000000000000801d	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000008022	movq	%rax, %rdi
0000000000008025	callq	___clang_call_terminate
000000000000802a	addb	%al, (%rax)
000000000000802c	addb	%al, (%rax)
000000000000802e	addb	%al, (%rax)
