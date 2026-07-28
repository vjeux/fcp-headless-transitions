__ZN18LiImageFilterChainD1Ev:
000000000051ac00	pushq	%rbp
000000000051ac01	movq	%rsp, %rbp
000000000051ac04	pushq	%rbx
000000000051ac05	pushq	%rax
000000000051ac06	movq	%rdi, %rbx
000000000051ac09	addq	$0x10, %rdi
000000000051ac0d	leaq	__ZTV7PCArrayI5PCPtrI13LiImageFilterE14PCArray_TraitsIS2_EE(%rip), %rax ## vtable for PCArray<PCPtr<LiImageFilter>, PCArray_Traits<PCPtr<LiImageFilter>>>
000000000051ac14	addq	$0x10, %rax
000000000051ac18	movq	%rax, 0x10(%rbx)
000000000051ac1c	movl	0x18(%rbx), %eax
000000000051ac1f	testl	%eax, %eax
000000000051ac21	movl	$0x1, %edx
000000000051ac26	cmovnsl	%eax, %edx
000000000051ac29	xorl	%esi, %esi
000000000051ac2b	callq	__ZN7PCArrayI5PCPtrI13LiImageFilterE14PCArray_TraitsIS2_EE6resizeEii ## PCArray<PCPtr<LiImageFilter>, PCArray_Traits<PCPtr<LiImageFilter>>>::resize(int, int)
000000000051ac30	movq	0x20(%rbx), %rdi
000000000051ac34	testq	%rdi, %rdi
000000000051ac37	je	0x51ac3e
000000000051ac39	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000051ac3e	movq	$0x0, 0x20(%rbx)
000000000051ac46	movl	$0x0, 0x18(%rbx)
000000000051ac4d	addq	$0x8, %rbx
000000000051ac51	movq	%rbx, %rdi
000000000051ac54	addq	$0x8, %rsp
000000000051ac58	popq	%rbx
000000000051ac59	popq	%rbp
000000000051ac5a	jmp	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000051ac5f	movq	%rax, %rdi
000000000051ac62	callq	___clang_call_terminate
000000000051ac67	nopw	(%rax,%rax)
